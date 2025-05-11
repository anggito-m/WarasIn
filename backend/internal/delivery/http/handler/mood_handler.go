package handler

import (
	"net/http"
	"strconv"

	"warasin/internal/usecase"

	"github.com/gin-gonic/gin"
)

type moodHandler struct {
	moodUsecase usecase.MoodUsecase
}

// NewMoodHandler creates a new mood handler
func NewMoodHandler(moodUsecase usecase.MoodUsecase) *moodHandler {
	return &moodHandler{
		moodUsecase: moodUsecase,
	}
}

func (h *moodHandler) Create(c *gin.Context) {
	userID, _ := c.Get("userID")

	var request struct {
		JournalID      int     `json:"journal_id"`
		EntryType      string  `json:"entry_type" binding:"required"`
		PrimaryEmotion string  `json:"primary_emotion" binding:"required"`
		IntensityLevel float64 `json:"intensity_level" binding:"required"`
		TriggerFactor  string  `json:"trigger_factor"`
		CopingStrategy string  `json:"coping_strategy"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	entry, err := h.moodUsecase.Create(
		userID.(int),
		request.JournalID,
		request.EntryType,
		request.PrimaryEmotion,
		request.IntensityLevel,
		request.TriggerFactor,
		request.CopingStrategy,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, entry)
}

func (h *moodHandler) GetAll(c *gin.Context) {
	userID, _ := c.Get("userID")

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	entryType := c.Query("entry_type")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}

	entries, total, err := h.moodUsecase.GetAll(userID.(int), limit, offset, startDate, endDate, entryType)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":   total,
		"entries": entries,
	})
}

func (h *moodHandler) GetByID(c *gin.Context) {
	userID, _ := c.Get("userID")
	entryID, err := strconv.Atoi(c.Param("entry_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid entry ID",
		})
		return
	}

	entry, err := h.moodUsecase.GetByID(entryID, userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	if entry == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Mood entry not found",
		})
		return
	}

	c.JSON(http.StatusOK, entry)
}
