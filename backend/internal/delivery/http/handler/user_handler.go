package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
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
		Email:        request.Email,
		Password:     request.Password,
		Name:         request.Name,
		UserType:     request.UserType,
		AuthProvider: "local",
	}

	createdUser, err := h.userUsecase.Register(user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"error":   false,
		"message": "User registered successfully",
		"data":    createdUser,
	})
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
		"error": false,
		"data": gin.H{
			"user_id":    user.ID,
			"token":      token,
			"expires_at": expiresAt.Format(time.RFC3339),
			"user":       user,
		},
	})
}

func (h *userHandler) GoogleLogin(c *gin.Context) {
	var request struct {
		Token string `json:"token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	// Verify Google token and get user info
	googleUserInfo, err := h.verifyGoogleToken(request.Token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid Google token: " + err.Error(),
		})
		return
	}

	// Process Google login
	user, err := h.userUsecase.GoogleLogin(googleUserInfo)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": err.Error(),
		})
		return
	}

	// Generate JWT token
	token, expiresAt, err := h.jwtService.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to generate token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"error": false,
		"data": gin.H{
			"user_id":    user.ID,
			"token":      token,
			"expires_at": expiresAt.Format(time.RFC3339),
			"user":       user,
		},
	})
}

// verifyGoogleToken verifies Google OAuth token and returns user info
func (h *userHandler) verifyGoogleToken(token string) (*domain.GoogleUserInfo, error) {
	// Google's userinfo endpoint
	resp, err := http.Get(fmt.Sprintf("https://www.googleapis.com/oauth2/v2/userinfo?access_token=%s", url.QueryEscape(token)))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid token: status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var googleUser domain.GoogleUserInfo
	if err := json.Unmarshal(body, &googleUser); err != nil {
		return nil, err
	}

	return &googleUser, nil
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

	c.JSON(http.StatusOK, gin.H{
		"error": false,
		"data":  user,
	})
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

	c.JSON(http.StatusOK, gin.H{
		"error": false,
		"data":  user,
	})
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
		"error":   false,
		"message": "Password changed successfully",
	})
}
