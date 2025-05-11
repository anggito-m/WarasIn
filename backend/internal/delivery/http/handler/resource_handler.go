package handler

import (
	"net/http"
	"strconv"

	"warasin/internal/usecase"

	"github.com/gin-gonic/gin"
)

type resourceHandler struct {
	resourceUsecase usecase.ResourceUsecase
}

// NewResourceHandler creates a new resource handler
func NewResourceHandler(resourceUsecase usecase.ResourceUsecase) *resourceHandler {
	return &resourceHandler{
		resourceUsecase: resourceUsecase,
	}
}

func (h *resourceHandler) GetResources(c *gin.Context) {
	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")
	userType := c.Query("user_type")
	contentType := c.Query("content_type")
	language := c.Query("language")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}

	resources, total, err := h.resourceUsecase.GetResources(userType, contentType, language, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":     total,
		"resources": resources,
	})
}

func (h *resourceHandler) GetPremiumResources(c *gin.Context) {
	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")
	contentType := c.Query("content_type")
	language := c.DefaultQuery("language", "en")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}

	// For premium resources, always set userType to "premium"
	resources, total, err := h.resourceUsecase.GetResources("premium", contentType, language, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":     total,
		"resources": resources,
	})
}

func (h *resourceHandler) GetResourceDetails(c *gin.Context) {
	resourceID, err := strconv.Atoi(c.Param("resource_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid resource ID",
		})
		return
	}

	resource, err := h.resourceUsecase.GetResourceDetails(resourceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	// Check access for premium resources
	if resource.UserType == "premium" {
		userType, exists := c.Get("userType")
		if !exists || userType != "premium" {
			// Provide only a preview for non-premium users
			// For example, truncate the content or provide a summary
			previewLength := 150 // characters
			if len(resource.Content) > previewLength {
				resource.Content = resource.Content[:previewLength] + "... [Premium content]"
			}
		}
	}

	c.JSON(http.StatusOK, resource)
}

func (h *resourceHandler) CreateInteraction(c *gin.Context) {
	userID, _ := c.Get("userID")
	resourceID, err := strconv.Atoi(c.Param("resource_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid resource ID",
		})
		return
	}

	var request struct {
		Rating       float64 `json:"rating" binding:"required,min=0,max=5"`
		FeedbackText string  `json:"feedback_text"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	interaction, err := h.resourceUsecase.CreateInteraction(userID.(int), resourceID, request.Rating, request.FeedbackText)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interaction)
}

func (h *resourceHandler) GetInteractions(c *gin.Context) {
	resourceID, err := strconv.Atoi(c.Param("resource_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid resource ID",
		})
		return
	}

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}

	interactions, total, err := h.resourceUsecase.GetInteractions(resourceID, limit, offset)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":        total,
		"interactions": interactions,
	})
}
