package usecase

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"warasin/internal/config" // Import your config package
	"warasin/internal/domain"
	"warasin/internal/repository/postgres"
)

// ExternalMoodModelResponse defines the structure for the mood prediction API response
type ExternalMoodModelResponse struct {
	Mood string `json:"mood"`
}

// MoodToIntensityMap maps mood strings to intensity levels (0.0 to 1.0)
var MoodToIntensityMap = map[string]float64{
	"joy":      1.0, // 100
	"love":     0.9, // 90
	"surprise": 0.7, // 70
	"fear":     0.3, // 30
	"sadness":  0.2, // 20
	"anger":    0.1, // 10
	// Add other moods if the model returns them, or a default
}

// Removed const moodModelAPIURL

type journalUsecase struct {
	journalRepo postgres.JournalRepository
	moodUsecase MoodUsecase
	cfg         *config.Config // Added config dependency
}

// JournalUsecase interface
type JournalUsecase interface {
	Create(userID int, content string) (*domain.Journal, error)
	GetByID(id int, userID int) (*domain.Journal, error)
	GetAll(userID int, limit, offset int, startDate, endDate string) ([]*domain.Journal, int, error)
	Update(id int, userID int, content string) (*domain.Journal, error)
	Delete(id int, userID int) error
	AnalyzeAndSaveJournalWithMood(userID int, textContent string) (*domain.Journal, *domain.MoodEntry, error)
}

// NewJournalUsecase creates a new journal use case
func NewJournalUsecase(journalRepo postgres.JournalRepository, moodUsecase MoodUsecase, cfg *config.Config) JournalUsecase { // Updated signature
	return &journalUsecase{
		journalRepo: journalRepo,
		moodUsecase: moodUsecase,
		cfg:         cfg, // Initialize config
	}
}

// AnalyzeAndSaveJournalWithMood is the new method
func (u *journalUsecase) AnalyzeAndSaveJournalWithMood(userID int, textContent string) (*domain.Journal, *domain.MoodEntry, error) {
	if textContent == "" {
		log.Println("WARN: textContent for mood analysis is empty, model API might reject.")
		// Model API kemungkinan akan mengembalikan 422 jika ini kosong.
		// Frontend seharusnya sudah melakukan validasi trim().
	}

	// 1. Panggil API model eksternal dengan field "text"
	// textContent adalah input asli dari pengguna.
	moodModelReqBody := map[string]string{"text": textContent} // <--- PERUBAHAN DI SINI
	jsonMoodModelBody, err := json.Marshal(moodModelReqBody)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to marshal request body for mood API: %w", err)
	}

	moodModelURL := u.cfg.MoodModelAPIURL
	if moodModelURL == "" {
		return nil, nil, errors.New("mood model API URL is not configured")
	}

	log.Printf("DEBUG: Sending to Mood Model API URL (%s) with payload: %s", moodModelURL, string(jsonMoodModelBody))

	resp, err := http.Post(moodModelURL, "application/json", bytes.NewBuffer(jsonMoodModelBody))
	if err != nil {
		return nil, nil, fmt.Errorf("failed to call mood prediction API (%s): %w", moodModelURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		errorBodyBytes, readErr := io.ReadAll(resp.Body)
		if readErr != nil {
			log.Printf("ERROR: Failed to read error response body from mood API: %v", readErr)
		}
		errorBodyStr := string(errorBodyBytes)
		log.Printf("ERROR: Mood prediction API at %s returned status %s. Body: %s", moodModelURL, resp.Status, errorBodyStr)
		return nil, nil, fmt.Errorf("mood prediction API returned non-OK status: %s. Details: %s", resp.Status, errorBodyStr)
	}

	var moodAPIResponse ExternalMoodModelResponse
	if err := json.NewDecoder(resp.Body).Decode(&moodAPIResponse); err != nil {
		return nil, nil, fmt.Errorf("failed to decode successful mood prediction API response: %w", err)
	}

	predictedMood := moodAPIResponse.Mood
	intensity, ok := MoodToIntensityMap[predictedMood]
	if !ok {
		log.Printf("WARN: Unknown mood predicted: '%s'. Assigning neutral intensity.", predictedMood)
		intensity = 0.5
	}

	// 2. Simpan entri jurnal ke database Anda
	// textContent (input asli pengguna) disimpan ke kolom 'content' di database Anda.
	createdJournal, err := u.Create(userID, textContent)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create journal entry: %w", err)
	}

	// 3. Simpan entri mood
	if u.moodUsecase == nil {
		return createdJournal, nil, errors.New("moodUsecase is not initialized in journalUsecase")
	}
	createdMoodEntry, err := u.moodUsecase.Create(
		userID,
		createdJournal.ID,
		"journal",
		predictedMood,
		intensity,
		"", "",
	)
	if err != nil {
		return createdJournal, nil, fmt.Errorf("failed to create mood entry: %w", err)
	}

	return createdJournal, createdMoodEntry, nil
}

// Implement or ensure Create, GetByID, GetAll, Update, Delete methods are complete as previously discussed
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
		var errParse error
		startDate, errParse = time.Parse(time.RFC3339, startDateStr)
		if errParse != nil {
			return nil, 0, fmt.Errorf("invalid start_date format: %w", errParse)
		}
	}

	if endDateStr != "" {
		var errParse error
		endDate, errParse = time.Parse(time.RFC3339, endDateStr)
		if errParse != nil {
			return nil, 0, fmt.Errorf("invalid end_date format: %w", errParse)
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
		return nil, errors.New("journal entry not found or does not belong to user")
	}
	journal.Content = content
	err = u.journalRepo.Update(journal)
	if err != nil {
		return nil, err
	}
	return journal, nil
}

func (u *journalUsecase) Delete(id int, userID int) error {
	// You might want to check if the journal exists and belongs to the user first
	// For example:
	// _, err := u.GetByID(id, userID)
	// if err != nil {
	// return err // could be DB error or not found error
	// }
	return u.journalRepo.Delete(id, userID)
}
