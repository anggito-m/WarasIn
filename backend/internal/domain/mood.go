package domain

import (
	"time"
)

type MoodEntry struct {
	ID             int       `json:"entry_id"`
	UserID         int       `json:"user_id"`
	JournalID      int       `json:"journal_id"`
	EntryType      string    `json:"entry_type"` // daily, event, reflection
	RecordedAt     time.Time `json:"recorded_at"`
	PrimaryEmotion string    `json:"primary_emotion"`
	IntensityLevel float64   `json:"intensity_level"`
	TriggerFactor  string    `json:"trigger_factor"`
	CopingStrategy string    `json:"coping_strategy"`
}
