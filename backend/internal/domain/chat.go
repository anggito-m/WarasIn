package domain

import (
	"time"
)

type ChatSession struct {
	ID        int        `json:"session_id"`
	UserID    int        `json:"user_id"`
	StartTime time.Time  `json:"start_time"`
	EndTime   *time.Time `json:"end_time,omitempty"`
}

type ChatMessage struct {
	ID             int       `json:"message_id"`
	SessionID      int       `json:"session_id"`
	MessageContent string    `json:"message_content"`
	SentAt         time.Time `json:"sent_at"`
	SenderType     string    `json:"sender_type"` // user, bot
}
