package usecase

import (
	"errors"
	"time"

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
	// Add "journal" to the list of valid entry types
	isValidEntryType := false
	allowedEntryTypes := []string{"daily", "event", "reflection", "journal"} // <-- MODIFIED HERE
	for _, allowedType := range allowedEntryTypes {
		if entryType == allowedType {
			isValidEntryType = true
			break
		}
	}
	if !isValidEntryType {
		return nil, errors.New("invalid entry type")
	}

	// Validate intensity level (0.0 to 1.0 as per previous context)
	if intensityLevel < 0 || intensityLevel > 1.0 { // Assuming 0-1 scale
		return nil, errors.New("intensity level must be between 0.0 and 1.0")
	}

	// Validate journal exists and belongs to the user if journal ID is provided (optional, but good practice)
	if journalID > 0 { // Assuming journalID can be 0 or less if not linked
		if u.journalRepo == nil {
			// This check is important if journalRepo is optional or might not be initialized
			return nil, errors.New("journal repository is not initialized in moodUsecase")
		}
		journal, err := u.journalRepo.GetByID(journalID, userID)
		if err != nil {
			// Log the actual error from journalRepo.GetByID for debugging
			// log.Printf("Error fetching journal %d for user %d: %v", journalID, userID, err)
			return nil, errors.New("failed to verify journal existence")
		}
		if journal == nil {
			return nil, errors.New("journal entry not found or does not belong to user")
		}
	}

	entry := &domain.MoodEntry{
		UserID: userID,
		// JournalID can be tricky if 0 is a valid ID.
		// If 0 means "not linked", ensure your DB schema allows NULL for journal_id
		// and your MoodEntry struct uses a pointer like *int or sql.NullInt64 for JournalID.
		// For simplicity, assuming journalID > 0 means it's linked.
		JournalID:      journalID,
		EntryType:      entryType,
		PrimaryEmotion: primaryEmotion,
		IntensityLevel: intensityLevel,
		TriggerFactor:  triggerFactor,
		CopingStrategy: copingStrategy,
		// RecordedAt will be set by moodRepo.Create
	}

	return u.moodRepo.Create(entry)
}

func (u *moodUsecase) GetByID(id int, userID int) (*domain.MoodEntry, error) {
	return u.moodRepo.GetByID(id, userID)
}

func (u *moodUsecase) GetAll(userID int, limit, offset int, startDateStr, endDateStr, entryType string) ([]*domain.MoodEntry, int, error) {
	var startDate, endDate time.Time

	if startDateStr != "" {
		var err error
		startDate, err = time.Parse(time.RFC3339, startDateStr)
		if err != nil {
			return nil, 0, errors.New("invalid start_date format")
		}
	}

	if endDateStr != "" {
		var err error
		endDate, err = time.Parse(time.RFC3339, endDateStr)
		if err != nil {
			return nil, 0, errors.New("invalid end_date format")
		}
	}

	return u.moodRepo.GetByUserID(userID, limit, offset, startDate, endDate, entryType)
}
