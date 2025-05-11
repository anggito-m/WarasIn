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

	c.JSON(http.StatusOK, journal)
}

func (h *journalHandler) GetAll(c *gin.Context) {
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
		c.JSON(http.StatusInternalServerError, gin.H{
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
		c.JSON(http.StatusBadRequest, gin.H{
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
		c.JSON(http.StatusBadRequest, gin.H{
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
