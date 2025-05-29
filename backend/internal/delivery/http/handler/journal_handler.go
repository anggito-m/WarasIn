package handler

import (
	"net/http"
	"strconv"

	"warasin/internal/usecase"

	"github.com/gin-gonic/gin"
)

type journalHandler struct {
	journalUsecase usecase.JournalUsecase
}

// NewJournalHandler creates a new journal handler
func NewJournalHandler(journalUsecase usecase.JournalUsecase) *journalHandler {
	return &journalHandler{
		journalUsecase: journalUsecase,
	}
}

func (h *journalHandler) Create(c *gin.Context) {
	userID, _ := c.Get("userID")

	var request struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	journal, err := h.journalUsecase.Create(userID.(int), request.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, journal) // Changed to 201 Created
}

// AnalyzeAndSave is the new handler function
func (h *journalHandler) AnalyzeAndSave(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": true, "message": "User ID not found in context"})
		return
	}
	userID, ok := userIDVal.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": true, "message": "User ID is of invalid type"})
		return
	}

	var request struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": true, "message": "Invalid request body: " + err.Error()})
		return
	}

	if request.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": true, "message": "Content cannot be empty"})
		return
	}

	journal, moodEntry, err := h.journalUsecase.AnalyzeAndSaveJournalWithMood(userID, request.Content)
	if err != nil {
		// More specific error handling could be added here based on error type
		c.JSON(http.StatusInternalServerError, gin.H{"error": true, "message": "Failed to analyze and save journal: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Journal entry and mood analyzed and saved successfully.",
		"journal":    journal,
		"mood_entry": moodEntry,
	})
}

func (h *journalHandler) GetAll(c *gin.Context) {
	userID, _ := c.Get("userID")

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

	journals, total, err := h.journalUsecase.GetAll(userID.(int), limit, offset, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":   total,
		"entries": journals,
	})
}

func (h *journalHandler) GetByID(c *gin.Context) {
	userID, _ := c.Get("userID")
	journalID, err := strconv.Atoi(c.Param("journal_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid journal ID",
		})
		return
	}

	journal, err := h.journalUsecase.GetByID(journalID, userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{ // Or StatusNotFound if err indicates that
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	if journal == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Journal entry not found",
		})
		return
	}

	c.JSON(http.StatusOK, journal)
}

func (h *journalHandler) Update(c *gin.Context) {
	userID, _ := c.Get("userID")
	journalID, err := strconv.Atoi(c.Param("journal_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid journal ID",
		})
		return
	}

	var request struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	journal, err := h.journalUsecase.Update(journalID, userID.(int), request.Content)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{ // Or StatusNotFound
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, journal)
}

func (h *journalHandler) Delete(c *gin.Context) {
	userID, _ := c.Get("userID")
	journalID, err := strconv.Atoi(c.Param("journal_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid journal ID",
		})
		return
	}

	err = h.journalUsecase.Delete(journalID, userID.(int))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{ // Or StatusNotFound
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Journal entry deleted successfully",
	})
}
