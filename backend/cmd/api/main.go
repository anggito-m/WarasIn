package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"warasin/internal/config"
	httpDelivery "warasin/internal/delivery/http"
	"warasin/internal/repository/postgres"
	"warasin/internal/usecase"
	"warasin/pkg/database"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize configuration
	cfg := config.New()

	// Set up database connection
	db, err := database.NewPostgresConnection(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize repositories
	userRepo := postgres.NewUserRepository(db)
	journalRepo := postgres.NewJournalRepository(db)
	moodRepo := postgres.NewMoodRepository(db)
	chatRepo := postgres.NewChatRepository(db)
	resourceRepo := postgres.NewResourceRepository(db)
	paymentRepo := postgres.NewPaymentRepository(db)
	activityRepo := postgres.NewActivityRepository(db)

	// Initialize use cases
	userUsecase := usecase.NewUserUsecase(userRepo)
	journalUsecase := usecase.NewJournalUsecase(journalRepo)
	moodUsecase := usecase.NewMoodUsecase(moodRepo)
	chatUsecase := usecase.NewChatUsecase(chatRepo)
	resourceUsecase := usecase.NewResourceUsecase(resourceRepo)
	paymentUsecase := usecase.NewPaymentUsecase(paymentRepo)
	activityUsecase := usecase.NewActivityUsecase(activityRepo)

	// Initialize router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Register API routes
	httpDelivery.RegisterRoutes(
		router,
		userUsecase,
		journalUsecase,
		moodUsecase,
		chatUsecase,
		resourceUsecase,
		paymentUsecase,
		activityUsecase,
	)

	// Create HTTP server
	server := &http.Server{
		Addr:    fmt.Sprintf(":%s", cfg.Port),
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Server running on port %s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Create a deadline to wait for current operations to complete
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exiting")
}
