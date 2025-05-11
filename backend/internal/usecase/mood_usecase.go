package usecase

import (
	"errors"

	"warasin/internal/domain"
	"warasin/internal/repository/postgres"
)

type moodUsecase struct {
	moodRepo    postgres.MoodRepository
	journalRepo postgres.JournalRepository
}

// MoodUsecase interface
type MoodUsecase interface {
	Create(userID int, journalID int, entryType, primaryEmotion string, intensityLevel float64, triggerFactor, copingStrategy string) (*domain.MoodEntry, error)
	GetByID(id int, userID int) (*domain.MoodEntry, error)
	GetAll(userID int, limit, offset int, startDate, endDate, entryType string) ([]*domain.MoodEntry, int, error)
}

// NewMoodUsecase creates a new mood use case
func NewMoodUsecase(moodRepo postgres.MoodRepository, journalRepo postgres.JournalRepository) MoodUsecase {
	return &moodUsecase{
		moodRepo:    moodRepo,
		journalRepo: journalRepo,
	}
}

func (u *moodUsecase) Create(userID int, journalID int, entryType, primaryEmotion string, intensityLevel float64, triggerFactor, copingStrategy string) (*domain.MoodEntry, error) {
	// Validate entry type
	if entryType != "daily" && entryType != "event" && entryType != "reflection" {
		return nil, errors.New("invalid entry type")
	}

	// Validate intensity level
	if intensityLevel < 0 || intensityLevel > 1 {
		return nil, errors.New("intensity level must be between 0 and 1")
	}

	// Validate journal exists and belongs to the user if journal ID is provided
	if journalID > 0 {
		journal, err := u.journalRepo.GetByID(journalID, userID)
		if err != nil {
			return nil, err
		}
		if journal == nil {
			return nil, errors.New("journal entry not found or does not belong to user")
		}
	}

	entry := &domain.MoodEntry{
		UserID:         userID,
		JournalID:      journalID,
		EntryType:      entryType,
		PrimaryEmotion: primaryEmotion,
		IntensityLevel: intensityLevel,
		TriggerFactor:  triggerFactor,
		CopingStrategy: copingStrategy,
	}

	return u.moodRepo.Create(entry)
}
