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
	cfg *config.Config,
	userUsecase usecase.UserUsecase,
	journalUsecase usecase.JournalUsecase,
	moodUsecase usecase.MoodUsecase,
	chatUsecase usecase.ChatUsecase,
	resourceUsecase usecase.ResourceUsecase,
	paymentUsecase usecase.PaymentUsecase,
	activityUsecase usecase.ActivityUsecase,
) {
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

	// User routes
	users := v1.Group("/users")
	{
		users.POST("/register", userHandler.Register)
		users.POST("/login", userHandler.Login)

		// Protected routes
		profile := users.Group("/profile").Use(authMiddleware)
		{
			profile.GET("", userHandler.GetProfile)
			profile.PATCH("", userHandler.UpdateProfile)
		}

		// Password change
		users.POST("/change-password", authMiddleware, userHandler.ChangePassword)
	}

	// Journal routes
	journal := v1.Group("/journal").Use(authMiddleware)
	{
		journal.POST("", journalHandler.Create)
		journal.GET("", journalHandler.GetAll)
		journal.GET("/:journal_id", journalHandler.GetByID)
		journal.PATCH("/:journal_id", journalHandler.Update)
		journal.DELETE("/:journal_id", journalHandler.Delete)
	}

	// Mood routes
	mood := v1.Group("/mood").Use(authMiddleware)
	{
		mood.POST("", moodHandler.Create)
		mood.GET("", moodHandler.GetAll)
		mood.GET("/:entry_id", moodHandler.GetByID)
	}

	// Chat routes
	chat := v1.Group("/chat").Use(authMiddleware)
	{
		sessions := chat.Group("/sessions")
		{
			sessions.POST("", chatHandler.StartSession)
			sessions.PATCH("/:session_id", chatHandler.EndSession)
			sessions.GET("", chatHandler.GetSessions)

			messages := sessions.Group("/:session_id/messages")
			{
				messages.POST("", chatHandler.SendMessage)
				messages.GET("", chatHandler.GetMessages)
			}
		}
	}

	// Resource routes
	resources := v1.Group("/resources")
	{
		// Public resources
		resources.GET("", resourceHandler.GetResources)
		resources.GET("/:resource_id", resourceHandler.GetResourceDetails)

		// Protected routes
		resourceAuth := resources.Group("").Use(authMiddleware)
		{
			resourceAuth.POST("/:resource_id/interactions", resourceHandler.CreateInteraction)
			resourceAuth.GET("/:resource_id/interactions", resourceHandler.GetInteractions)
		}

		// Premium resources
		resourcePremium := resources.Group("/premium").Use(authMiddleware, premiumMiddleware)
		{
			resourcePremium.GET("", resourceHandler.GetPremiumResources)
		}
	}

	// Payment routes
	payments := v1.Group("/payments").Use(authMiddleware)
	{
		payments.POST("", paymentHandler.CreatePayment)
		payments.GET("", paymentHandler.GetPaymentHistory)
	}

	// Activity log routes
	activity := v1.Group("/activity").Use(authMiddleware)
	{
		activity.GET("", activityHandler.GetActivityHistory)
	}
}
