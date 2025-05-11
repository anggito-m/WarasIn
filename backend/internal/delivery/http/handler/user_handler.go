package handler

import (
	"net/http"
	"time"

	"warasin/internal/domain"
	"warasin/internal/usecase"
	"warasin/pkg/auth"

	"github.com/gin-gonic/gin"
)

type userHandler struct {
	userUsecase usecase.UserUsecase
	jwtService  auth.JWTService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userUsecase usecase.UserUsecase, jwtService auth.JWTService) *userHandler {
	return &userHandler{
		userUsecase: userUsecase,
		jwtService:  jwtService,
	}
}

func (h *userHandler) Register(c *gin.Context) {
	var request struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
		Name     string `json:"name" binding:"required"`
		UserType string `json:"user_type"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	user := &domain.User{
		Email:    request.Email,
		Password: request.Password,
		Name:     request.Name,
		UserType: request.UserType,
	}

	createdUser, err := h.userUsecase.Register(user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, createdUser)
}

func (h *userHandler) Login(c *gin.Context) {
	var request struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	user, err := h.userUsecase.Login(request.Email, request.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	token, expiresAt, err := h.jwtService.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to generate token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id":    user.ID,
		"token":      token,
		"expires_at": expiresAt.Format(time.RFC3339),
	})
}

func (h *userHandler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("userID")
	user, err := h.userUsecase.GetProfile(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *userHandler) UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("userID")

	var request struct {
		Name     string `json:"name"`
		UserType string `json:"user_type"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	// Get current user profile
	user, err := h.userUsecase.GetProfile(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "User not found",
		})
		return
	}

	// Update fields
	if request.Name != "" {
		user.Name = request.Name
	}
	if request.UserType != "" {
		user.UserType = request.UserType
	}

	// Save changes
	err = h.userUsecase.UpdateProfile(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *userHandler) ChangePassword(c *gin.Context) {
	userID, _ := c.Get("userID")

	var request struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	err := h.userUsecase.ChangePassword(userID.(int), request.CurrentPassword, request.NewPassword)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password changed successfully",
	})
}
