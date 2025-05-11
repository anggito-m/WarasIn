package domain

import (
	"time"
)

type User struct {
	ID        int       `json:"user_id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Password  string    `json:"-"`         // Never expose in JSON
	UserType  string    `json:"user_type"` // standard, premium
	CreatedAt time.Time `json:"created_at"`
}
