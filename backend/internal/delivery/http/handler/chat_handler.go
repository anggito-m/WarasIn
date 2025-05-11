package handler

import (
	"net/http"
	"strconv"

	"warasin/internal/usecase"

	"github.com/gin-gonic/gin"
)

type chatHandler struct {
	chatUsecase usecase.ChatUsecase
}

// NewChatHandler creates a new chat handler
func NewChatHandler(chatUsecase usecase.ChatUsecase) *chatHandler {
	return &chatHandler{
		chatUsecase: chatUsecase,
	}
}

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

	var request struct {
		EndTime string `json:"end_time"` // Optional, will use current time if not provided
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		// Just use current time if no JSON provided
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
	userID, _ := c.Get("userID")

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}

	sessions, total, err := h.chatUsecase.GetSessions(userID.(int), limit, offset, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":    total,
		"sessions": sessions,
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

	// Parse query parameters
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
