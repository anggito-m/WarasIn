package usecase

import (
	"errors"
	"time"

	"warasin/internal/domain"
	"warasin/internal/repository/postgres"
)

type journalUsecase struct {
	journalRepo postgres.JournalRepository
}

// JournalUsecase interface
type JournalUsecase interface {
	Create(userID int, content string) (*domain.Journal, error)
	GetByID(id int, userID int) (*domain.Journal, error)
	GetAll(userID int, limit, offset int, startDate, endDate string) ([]*domain.Journal, int, error)
	Update(id int, userID int, content string) (*domain.Journal, error)
	Delete(id int, userID int) error
}

// NewJournalUsecase creates a new journal use case
func NewJournalUsecase(journalRepo postgres.JournalRepository) JournalUsecase {
	return &journalUsecase{
		journalRepo: journalRepo,
	}
}

func (u *journalUsecase) Create(userID int, content string) (*domain.Journal, error) {
	journal := &domain.Journal{
		UserID:  userID,
		Content: content,
	}

	return u.journalRepo.Create(journal)
}

func (u *journalUsecase) GetByID(id int, userID int) (*domain.Journal, error) {
	return u.journalRepo.GetByID(id, userID)
}

func (u *journalUsecase) GetAll(userID int, limit, offset int, startDateStr, endDateStr string) ([]*domain.Journal, int, error) {
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

	return u.journalRepo.GetByUserID(userID, limit, offset, startDate, endDate)
}

func (u *journalUsecase) Update(id int, userID int, content string) (*domain.Journal, error) {
	journal, err := u.journalRepo.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	if journal == nil {
		return nil, errors.New("journal entry not found")
	}

	journal.Content = content

	err = u.journalRepo.Update(journal)
	if err != nil {
		return nil, err
	}

	return journal, nil
}

func (u *journalUsecase) Delete(id int, userID int) error {
	return u.journalRepo.Delete(id, userID)
}
