package config

import (
	"os"
	"time"
)

// Config holds all configuration for the application
type Config struct {
	AppName         string
	Environment     string
	Port            string
	DatabaseURL     string
	JWTSecret       string
	JWTExpiresIn    time.Duration
	MoodModelAPIURL string
}

// New creates a new Config struct from environment variables
func New() *Config {
	jwtExpiresInHours := 24 // Default 24 hours

	return &Config{
		AppName:         getEnv("APP_NAME", "WarasIn"),
		Environment:     getEnv("ENVIRONMENT", "development"),
		Port:            getEnv("PORT", "8080"),
		DatabaseURL:     getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/warasin?sslmode=disable"),
		JWTSecret:       getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpiresIn:    time.Duration(jwtExpiresInHours) * time.Hour,
		MoodModelAPIURL: getEnv("MOOD_MODEL_API_URL", "https://warasinjournal.azurewebsites.net/predict"),
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
