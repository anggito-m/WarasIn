package http

import (
	"github.com/gin-gonic/gin"

	"warasin/internal/config"
	"warasin/internal/delivery/http/handler"
	"warasin/internal/delivery/http/middleware"
	"warasin/internal/usecase"
	"warasin/pkg/auth"
)

// RegisterRoutes registers all API routes
func RegisterRoutes(
	router *gin.Engine,
	userUsecase usecase.UserUsecase,
	journalUsecase usecase.JournalUsecase,
	moodUsecase usecase.MoodUsecase,
	chatUsecase usecase.ChatUsecase,
	resourceUsecase usecase.ResourceUsecase,
	paymentUsecase usecase.PaymentUsecase,
	activityUsecase usecase.ActivityUsecase,
) {
	// Get configuration
	cfg := config.New()

	// Initialize JWT service
	jwtService := auth.NewJWTService(cfg.JWTSecret, cfg.JWTExpiresIn)

	// API version group
	v1 := router.Group("/v1")

	// Initialize handlers
	userHandler := handler.NewUserHandler(userUsecase, jwtService)
	journalHandler := handler.NewJournalHandler(journalUsecase)
	moodHandler := handler.NewMoodHandler(moodUsecase)
	chatHandler := handler.NewChatHandler(chatUsecase)
	resourceHandler := handler.NewResourceHandler(resourceUsecase)
	paymentHandler := handler.NewPaymentHandler(paymentUsecase)
	activityHandler := handler.NewActivityHandler(activityUsecase)

	// Auth middleware
	authMiddleware := middleware.AuthMiddleware(jwtService)
	premiumMiddleware := middleware.RequireUserType("premium")

	// Activity logging middleware
	logActivityMiddleware := handler.LogUserActivity(activityUsecase)

	// User routes
	users := v1.Group("/users")
	{
		users.POST("/register", userHandler.Register)
		users.POST("/login", userHandler.Login, logActivityMiddleware)
		users.POST("/google-login", userHandler.GoogleLogin, logActivityMiddleware)

		// Protected routes
		profile := users.Group("/profile").Use(authMiddleware)
		{
			profile.GET("", userHandler.GetProfile)
			profile.PATCH("", userHandler.UpdateProfile, logActivityMiddleware)
		}

		// Password change
		users.POST("/change-password", authMiddleware, userHandler.ChangePassword, logActivityMiddleware)
	}

	// Journal routes
	journal := v1.Group("/journal").Use(authMiddleware)
	{
		journal.POST("", journalHandler.Create, logActivityMiddleware)                          // For creating journal directly
		journal.POST("/analyze-and-save", journalHandler.AnalyzeAndSave, logActivityMiddleware) // New route
		journal.GET("", journalHandler.GetAll)
		journal.GET("/:journal_id", journalHandler.GetByID)
		journal.PATCH("/:journal_id", journalHandler.Update, logActivityMiddleware)
		journal.DELETE("/:journal_id", journalHandler.Delete, logActivityMiddleware)
	}

	// Mood routes
	mood := v1.Group("/mood").Use(authMiddleware)
	{
		mood.POST("", moodHandler.Create, logActivityMiddleware)
		mood.GET("", moodHandler.GetAll)
		mood.GET("/:entry_id", moodHandler.GetByID)
	}

	// Chat routes - Updated dengan Gemini integration
	chat := v1.Group("/chat")
	chat.Use(authMiddleware)
	{
		// Session management
		sessions := chat.Group("/sessions")
		{
			sessions.POST("", chatHandler.StartSession, logActivityMiddleware)
			sessions.PATCH("/:session_id", chatHandler.EndSession, logActivityMiddleware)
			sessions.DELETE("/:session_id", chatHandler.DeleteSession, logActivityMiddleware) // Tambahkan line ini
			sessions.GET("", chatHandler.GetSessions)
		}

		// Chat messages routes
		messages := chat.Group("/sessions/:session_id/messages")
		{
			messages.POST("", chatHandler.SendMessage, logActivityMiddleware)
			messages.GET("", chatHandler.GetMessages)
		}

		// Google Gemini AI Chat endpoint (FREE)
		chat.POST("/gemini", chatHandler.GeminiChat, logActivityMiddleware)
	}

	// Resource routes
	resources := v1.Group("/resources")
	{
		// Public resources
		resources.GET("", resourceHandler.GetResources)
		resources.GET("/:resource_id", resourceHandler.GetResourceDetails)
	}

	// Protected resource routes
	resourceAuth := v1.Group("/resources").Use(authMiddleware)
	{
		resourceAuth.POST("/:resource_id/interactions", resourceHandler.CreateInteraction, logActivityMiddleware)
		resourceAuth.GET("/:resource_id/interactions", resourceHandler.GetInteractions)
	}

	// Premium resources
	resourcePremium := v1.Group("/resources/premium").Use(authMiddleware, premiumMiddleware)
	{
		resourcePremium.GET("", resourceHandler.GetPremiumResources)
	}

	// Payment routes
	payments := v1.Group("/payments").Use(authMiddleware)
	{
		payments.POST("", paymentHandler.CreatePayment, logActivityMiddleware)
		payments.GET("", paymentHandler.GetPaymentHistory)
	}

	// Activity log routes
	activity := v1.Group("/activity").Use(authMiddleware)
	{
		activity.GET("", activityHandler.GetActivityHistory)
	}
}
