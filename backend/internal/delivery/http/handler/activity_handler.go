package handler

import (
	"net/http"
	"strconv"

	"warasin/internal/usecase"

	"github.com/gin-gonic/gin"
)

type activityHandler struct {
	activityUsecase usecase.ActivityUsecase
}

// NewActivityHandler creates a new activity handler
func NewActivityHandler(activityUsecase usecase.ActivityUsecase) *activityHandler {
	return &activityHandler{
		activityUsecase: activityUsecase,
	}
}

func (h *activityHandler) GetActivityHistory(c *gin.Context) {
	userID, _ := c.Get("userID")

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	activity := c.Query("activity")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}

	logs, total, err := h.activityUsecase.GetActivityHistory(userID.(int), limit, offset, startDate, endDate, activity)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":      total,
		"activities": logs,
	})
}

// LogUserActivity middleware for logging user activities
func LogUserActivity(activityUsecase usecase.ActivityUsecase) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Process request first
		c.Next()

		// Get user info if authenticated
		userID, exists := c.Get("userID")
		if !exists {
			return // Skip logging for unauthenticated requests
		}

		// Determine activity based on path and method
		path := c.Request.URL.Path
		method := c.Request.Method

		var activity string
		switch {
		case method == "POST" && path == "/v1/users/login":
			activity = "login"
		case method == "POST" && path == "/v1/journal":
			activity = "journal_create"
		case method == "PATCH" && path == "/v1/journal":
			activity = "journal_update"
		case method == "DELETE" && path == "/v1/journal":
			activity = "journal_delete"
		case method == "POST" && path == "/v1/mood":
			activity = "mood_create"
		case method == "POST" && path == "/v1/chat/sessions":
			activity = "chat_session_start"
		case method == "PATCH" && path == "/v1/chat/sessions":
			activity = "chat_session_end"
		case method == "POST" && path == "/v1/payments":
			activity = "payment_create"
		default:
			activity = method + "_" + path
		}

		// Log the activity
		_ = activityUsecase.LogActivity(
			userID.(int),
			activity,
			c.ClientIP(),
			c.GetHeader("User-Agent"),
			c.GetHeader("User-Agent"),
		)
	}
}
