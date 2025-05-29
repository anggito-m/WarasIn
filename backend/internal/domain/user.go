package domain

import (
	"time"
)

type User struct {
	ID           int       `json:"user_id"`
	Email        string    `json:"email"`
	Name         string    `json:"name"`
	Password     string    `json:"-"`             // Never expose in JSON, nullable for OAuth users
	UserType     string    `json:"user_type"`     // standard, premium
	GoogleID     string    `json:"-"`             // Google OAuth ID, never expose
	Avatar       string    `json:"avatar"`        // Profile picture URL
	AuthProvider string    `json:"auth_provider"` // local, google
	CreatedAt    time.Time `json:"created_at"`
}

// GoogleUserInfo represents the user info from Google OAuth
type GoogleUserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}
