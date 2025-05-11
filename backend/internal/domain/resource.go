package domain

import (
	"time"
)

type Resource struct {
	ID          int       `json:"resource_id"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	PublishedAt time.Time `json:"published_at"`
	Language    string    `json:"language"`
	UserType    string    `json:"user_type"` // standard, premium
	ViewCount   int       `json:"view_count"`
	ContentType string    `json:"content_type"` // article, video, audio, exercise
}

type ResourceInteraction struct {
	ID           int     `json:"interaction_id"`
	ResourceID   int     `json:"resource_id"`
	UserID       int     `json:"user_id"`
	Rating       float64 `json:"rating"`
	FeedbackText string  `json:"feedback_text"`
}
