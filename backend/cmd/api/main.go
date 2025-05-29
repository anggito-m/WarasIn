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

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func runMigrations(databaseURL string) {
	m, err := migrate.New("file://migrations", databaseURL)
	if err != nil {
		log.Printf("Could not create migrate instance: %v", err)
		return
	}
	defer m.Close()

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Printf("Could not run migrations: %v", err)
		return
	}

	log.Println("Migrations ran successfully")
}

func main() {
	log.Println("Starting WarasIn API...")

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize configuration
	log.Println("Initializing configuration...")
	cfg := config.New()
	log.Printf("Port: %s", cfg.Port)

	// Run migrations
	log.Println("Running migrations...")
	runMigrations(cfg.DatabaseURL)

	// Set up database connection
	log.Println("Connecting to database...")
	db, err := database.NewPostgresConnection(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("Database connected successfully!")

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
	moodUsecase := usecase.NewMoodUsecase(moodRepo, journalRepo)
	journalUsecase := usecase.NewJournalUsecase(journalRepo, moodUsecase, cfg)
	chatUsecase := usecase.NewChatUsecase(chatRepo)
	resourceUsecase := usecase.NewResourceUsecase(resourceRepo)
	paymentUsecase := usecase.NewPaymentUsecase(paymentRepo, userRepo)
	activityUsecase := usecase.NewActivityUsecase(activityRepo)

	// Initialize router
	router := gin.Default()

	// Configure CORS based on environment
	corsConfig := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	// Set allowed origins based on environment
	if gin.Mode() == gin.ReleaseMode {
		// Production - specify your Vercel domain
		corsConfig.AllowOrigins = []string{
			"https://waras-in.vercel.app", // Removed trailing slash
			// Add any other production domains here
		}
	} else {
		// Development - allow localhost
		corsConfig.AllowOrigins = []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://127.0.0.1:3000",
		}
	}

	router.Use(cors.New(corsConfig))

	// Add root route
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message":     "Welcome to WarasIn API",
			"status":      "running",
			"version":     "1.0.0",
			"description": "Mental Health & Wellness API",
			"endpoints": gin.H{
				"health":     "/health",
				"api_docs":   "/api/v1",
				"users":      "/api/v1/users",
				"journals":   "/api/v1/journals",
				"moods":      "/api/v1/moods",
				"chats":      "/api/v1/chats",
				"resources":  "/api/v1/resources",
				"payments":   "/api/v1/payments",
				"activities": "/api/v1/activities",
			},
			"timestamp": time.Now().UTC(),
		})
	})

	// Add a health check endpoint for Render
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "ok",
			"message":   "WarasIn API is healthy",
			"database":  "connected",
			"timestamp": time.Now().UTC(),
		})
	})

	// Add API info endpoint
	router.GET("/api", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"api_name":    "WarasIn API",
			"version":     "1.0.0",
			"description": "Mental Health & Wellness Platform API",
			"author":      "WarasIn Team",
		})
	})

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
		log.Printf("Server starting on port %s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	log.Println("Server started successfully! 🚀")

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
