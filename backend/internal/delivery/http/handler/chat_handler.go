package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"warasin/internal/domain"
	"warasin/internal/usecase"

	"github.com/gin-gonic/gin"
)

type chatHandler struct {
	chatUsecase usecase.ChatUsecase
}

// Google Gemini API structures
type GeminiContent struct {
	Parts []GeminiPart `json:"parts"`
	Role  string       `json:"role,omitempty"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiRequest struct {
	Contents         []GeminiContent `json:"contents"`
	GenerationConfig struct {
		Temperature     float64 `json:"temperature"`
		MaxOutputTokens int     `json:"maxOutputTokens"`
		TopP            float64 `json:"topP"`
		TopK            int     `json:"topK"`
	} `json:"generationConfig"`
	SafetySettings []struct {
		Category  string `json:"category"`
		Threshold string `json:"threshold"`
	} `json:"safetySettings"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
			Role string `json:"role"`
		} `json:"content"`
		FinishReason  string `json:"finishReason"`
		SafetyRatings []struct {
			Category    string `json:"category"`
			Probability string `json:"probability"`
		} `json:"safetyRatings"`
	} `json:"candidates"`
	UsageMetadata struct {
		PromptTokenCount     int `json:"promptTokenCount"`
		CandidatesTokenCount int `json:"candidatesTokenCount"`
		TotalTokenCount      int `json:"totalTokenCount"`
	} `json:"usageMetadata"`
}

type ChatbotRequest struct {
	SessionID int    `json:"session_id"`
	Message   string `json:"message" binding:"required"`
}

type ChatbotResponse struct {
	Response   string `json:"response"`
	SessionID  int    `json:"session_id"`
	MessageID  int    `json:"message_id"`
	TokensUsed int    `json:"tokens_used,omitempty"`
	Model      string `json:"model"`
}

// NewChatHandler creates a new chat handler
func NewChatHandler(chatUsecase usecase.ChatUsecase) *chatHandler {
	return &chatHandler{
		chatUsecase: chatUsecase,
	}
}

// Mental health system prompt yang dioptimasi untuk Gemini
const MENTAL_HEALTH_SYSTEM_PROMPT = `You are MindCareBot 🌿, a compassionate and professional mental health companion created to provide emotional support and guidance.

## Your Core Purpose:
- Provide empathetic emotional support and validation
- Offer evidence-based coping strategies and wellness techniques
- Encourage healthy mental health practices
- Be a caring, non-judgmental listening companion

## Your Communication Style:
- Use warm, supportive, and encouraging tone
- Be concise but meaningful in your responses
- Include gentle emojis occasionally (🌿, 💙, 🤗, ✨)
- Validate feelings before offering suggestions
- Ask thoughtful follow-up questions when appropriate

## Mental Health Strategies You Can Suggest:
- Breathing exercises (4-7-8 technique, box breathing)
- Mindfulness and grounding techniques (5-4-3-2-1 method)
- Journaling prompts for self-reflection
- Progressive muscle relaxation
- Positive affirmations and self-compassion practices
- Healthy routine and sleep hygiene tips
- Light physical activity suggestions

## Important Guidelines:
- Always validate the person's feelings first
- Never diagnose or provide medical advice
- Encourage professional help for serious concerns
- If someone expresses suicidal thoughts or self-harm, gently but firmly encourage immediate professional help
- Stay within your role as a supportive companion, not a therapist

## Response Format:
Keep responses focused, practical, and hopeful. End with gentle encouragement or a supportive question when appropriate.

Remember: You are here to support and guide, not to replace professional mental health care.`

// Google Gemini Chat Handler (FREE - 15 requests/minute, 1500 requests/day)
func (h *chatHandler) GeminiChat(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   true,
			"message": "User not authenticated",
		})
		return
	}

	var request ChatbotRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid request format: " + err.Error(),
		})
		return
	}

	// Validate session belongs to user (jika session_id disediakan)
	if request.SessionID > 0 {
		_, _, err := h.chatUsecase.GetMessages(request.SessionID, userID.(int), 1, 0)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   true,
				"message": "Invalid session or session not found",
			})
			return
		}
	}

	// Build conversation
	contents, err := h.buildGeminiContents(request.SessionID, userID.(int), request.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to build conversation context: " + err.Error(),
		})
		return
	}

	// Call Gemini API
	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	geminiResp, err := h.CallGeminiAPI(ctx, contents)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": fmt.Sprintf("AI service error: %v", err),
		})
		return
	}

	var aiResponse string
	if len(geminiResp.Candidates) > 0 && len(geminiResp.Candidates[0].Content.Parts) > 0 {
		aiResponse = strings.TrimSpace(geminiResp.Candidates[0].Content.Parts[0].Text)
	}

	if aiResponse == "" {
		aiResponse = "I'm here to support you. How can I help you today? 🌿"
	}

	// Save bot response to database (jika session valid)
	var botMessage *domain.ChatMessage
	if request.SessionID > 0 {
		botMessage, err = h.chatUsecase.SendMessage(request.SessionID, userID.(int), aiResponse, "bot")
		if err != nil {
			fmt.Printf("Failed to save bot message: %v\n", err)
		}
	}

	response := ChatbotResponse{
		Response:   aiResponse,
		SessionID:  request.SessionID,
		Model:      "gemini-1.5-flash",
		TokensUsed: geminiResp.UsageMetadata.TotalTokenCount,
	}

	if botMessage != nil {
		response.MessageID = botMessage.ID
	}

	c.JSON(http.StatusOK, response)
}

func (h *chatHandler) CallGeminiAPI(ctx context.Context, contents []GeminiContent) (*GeminiResponse, error) {
	// Get free API key from https://aistudio.google.com/app/apikey
	geminiKey := os.Getenv("GEMINI_API_KEY")
	if geminiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY environment variable not set")
	}

	// Gunakan model gratis terbaik
	apiURL := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%s", geminiKey)

	requestBody := GeminiRequest{
		Contents: contents,
		GenerationConfig: struct {
			Temperature     float64 `json:"temperature"`
			MaxOutputTokens int     `json:"maxOutputTokens"`
			TopP            float64 `json:"topP"`
			TopK            int     `json:"topK"`
		}{
			Temperature:     0.7,
			MaxOutputTokens: 500,
			TopP:            0.8,
			TopK:            40,
		},
		SafetySettings: []struct {
			Category  string `json:"category"`
			Threshold string `json:"threshold"`
		}{
			{
				Category:  "HARM_CATEGORY_HARASSMENT",
				Threshold: "BLOCK_MEDIUM_AND_ABOVE",
			},
			{
				Category:  "HARM_CATEGORY_HATE_SPEECH",
				Threshold: "BLOCK_MEDIUM_AND_ABOVE",
			},
			{
				Category:  "HARM_CATEGORY_SEXUALLY_EXPLICIT",
				Threshold: "BLOCK_MEDIUM_AND_ABOVE",
			},
			{
				Category:  "HARM_CATEGORY_DANGEROUS_CONTENT",
				Threshold: "BLOCK_MEDIUM_AND_ABOVE",
			},
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	var geminiResp GeminiResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &geminiResp, nil
}

func (h *chatHandler) buildGeminiContents(sessionID int, userID int, currentMessage string) ([]GeminiContent, error) {
	contents := []GeminiContent{
		{
			Parts: []GeminiPart{{
				Text: MENTAL_HEALTH_SYSTEM_PROMPT,
			}},
			Role: "user",
		},
		{
			Parts: []GeminiPart{{
				Text: "I understand my role as MindCareBot 🌿. I'm here to provide compassionate mental health support and guidance. I'm ready to listen and help with empathy, practical coping strategies, and encouragement. How can I support you today?",
			}},
			Role: "model",
		},
	}

	// Add conversation history jika session ada
	if sessionID > 0 {
		messages, _, err := h.chatUsecase.GetMessages(sessionID, userID, 8, 0)
		if err != nil {
			return nil, err
		}

		// Add conversation history (reverse order)
		for i := len(messages) - 1; i >= 0; i-- {
			msg := messages[i]
			role := "user"
			if msg.SenderType == "bot" {
				role = "model"
			}

			contents = append(contents, GeminiContent{
				Parts: []GeminiPart{{Text: msg.MessageContent}},
				Role:  role,
			})
		}
	}

	// Add current message
	contents = append(contents, GeminiContent{
		Parts: []GeminiPart{{Text: currentMessage}},
		Role:  "user",
	})

	return contents, nil
}

// Existing handlers tetap sama
func (h *chatHandler) StartSession(c *gin.Context) {
	userID, _ := c.Get("userID")

	session, err := h.chatUsecase.StartSession(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, session)
}

func (h *chatHandler) EndSession(c *gin.Context) {
	userID, _ := c.Get("userID")
	sessionID, err := strconv.Atoi(c.Param("session_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid session ID",
		})
		return
	}

	session, err := h.chatUsecase.EndSession(sessionID, userID.(int))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, session)
}

func (h *chatHandler) GetSessions(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   true,
			"message": "User not authenticated",
		})
		return
	}

	// Parse query parameters with defaults
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")
	// startDate := c.Query("start_date")
	// endDate := c.Query("end_date")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// For now, ignore date filters to avoid SQL parameter issues
	// Pass empty strings which will be handled properly in usecase
	sessions, total, err := h.chatUsecase.GetSessions(userID.(int), limit, offset, "", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to get sessions: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"sessions": sessions,
		"total":    total,
	})
}

func (h *chatHandler) SendMessage(c *gin.Context) {
	userID, _ := c.Get("userID")
	sessionID, err := strconv.Atoi(c.Param("session_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid session ID",
		})
		return
	}

	var request struct {
		MessageContent string `json:"message_content" binding:"required"`
		SenderType     string `json:"sender_type" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	message, err := h.chatUsecase.SendMessage(sessionID, userID.(int), request.MessageContent, request.SenderType)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, message)
}

func (h *chatHandler) GetMessages(c *gin.Context) {
	userID, _ := c.Get("userID")
	sessionID, err := strconv.Atoi(c.Param("session_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid session ID",
		})
		return
	}

	limitStr := c.DefaultQuery("limit", "50")
	beforeIDStr := c.DefaultQuery("before_id", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 50
	}

	beforeID, err := strconv.Atoi(beforeIDStr)
	if err != nil {
		beforeID = 0
	}

	messages, total, err := h.chatUsecase.GetMessages(sessionID, userID.(int), limit, beforeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":    total,
		"messages": messages,
	})
}

func (h *chatHandler) DeleteSession(c *gin.Context) {
	userID, _ := c.Get("userID")
	sessionID, err := strconv.Atoi(c.Param("session_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid session ID",
		})
		return
	}

	err = h.chatUsecase.DeleteSession(sessionID, userID.(int))
	if err != nil {
		if err.Error() == "session not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   true,
				"message": "Session not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Session deleted successfully",
	})
}
