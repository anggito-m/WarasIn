package domain

import (
	"time"
)

type Payment struct {
	ID          int       `json:"payment_id"`
	UserID      int       `json:"user_id"`
	PremiumType string    `json:"premium_type"` // monthly, yearly
	PaymentAt   time.Time `json:"payment_at"`
	Status      string    `json:"status"` // completed, pending, failed
}
