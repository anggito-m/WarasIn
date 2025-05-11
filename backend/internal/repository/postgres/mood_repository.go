package postgres

import (
	"database/sql"
	"strconv"
	"time"

	"warasin/internal/domain"
)

type moodRepository struct {
	db *sql.DB
}

// MoodRepository interface
type MoodRepository interface {
	Create(entry *domain.MoodEntry) (*domain.MoodEntry, error)
	GetByID(id int, userID int) (*domain.MoodEntry, error)
	GetByUserID(userID int, limit, offset int, startDate, endDate time.Time, entryType string) ([]*domain.MoodEntry, int, error)
}

// NewMoodRepository creates a new mood repository
func NewMoodRepository(db *sql.DB) MoodRepository {
	return &moodRepository{
		db: db,
	}
}

func (r *moodRepository) Create(entry *domain.MoodEntry) (*domain.MoodEntry, error) {
	now := time.Now()
	query := `
		INSERT INTO mood_entry (user_id, journal_id, entry_type, recorder_at, primary_emotion, intensity_level, trigger_factor, coping_strategy)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING entry_id
	`

	err := r.db.QueryRow(
		query,
		entry.UserID,
		entry.JournalID,
		entry.EntryType,
		now,
		entry.PrimaryEmotion,
		entry.IntensityLevel,
		entry.TriggerFactor,
		entry.CopingStrategy,
	).Scan(&entry.ID)

	if err != nil {
		return nil, err
	}

	entry.RecordedAt = now
	return entry, nil
}

func (r *moodRepository) GetByID(id int, userID int) (*domain.MoodEntry, error) {
	var entry domain.MoodEntry

	query := `
		SELECT entry_id, user_id, journal_id, entry_type, recorder_at, primary_emotion, intensity_level, trigger_factor, coping_strategy
		FROM mood_entry
		WHERE entry_id = $1 AND user_id = $2
	`

	row := r.db.QueryRow(query, id, userID)
	err := row.Scan(
		&entry.ID,
		&entry.UserID,
		&entry.JournalID,
		&entry.EntryType,
		&entry.RecordedAt,
		&entry.PrimaryEmotion,
		&entry.IntensityLevel,
		&entry.TriggerFactor,
		&entry.CopingStrategy,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Entry not found
		}
		return nil, err
	}

	return &entry, nil
}

func (r *moodRepository) GetByUserID(userID int, limit, offset int, startDate, endDate time.Time, entryType string) ([]*domain.MoodEntry, int, error) {
	// Get total count
	countQuery := `
		SELECT COUNT(*)
		FROM mood_entry
		WHERE user_id = $1
	`

	args := []interface{}{userID}
	argIndex := 2

	// Add filters if provided
	hasStartDate := !startDate.IsZero()
	hasEndDate := !endDate.IsZero()
	hasEntryType := entryType != ""

	if hasStartDate {
		countQuery += " AND recorder_at >= $" + strconv.Itoa(argIndex)
		args = append(args, startDate)
		argIndex++
	}
	if hasEndDate {
		countQuery += " AND recorder_at <= $" + strconv.Itoa(argIndex)
		args = append(args, endDate)
		argIndex++
	}
	if hasEntryType {
		countQuery += " AND entry_type = $" + strconv.Itoa(argIndex)
		args = append(args, entryType)
		argIndex++
	}

	var totalCount int
	err := r.db.QueryRow(countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	if limit <= 0 {
		limit = 10 // Default limit
	}

	query := `
		SELECT entry_id, user_id, journal_id, entry_type, recorder_at, primary_emotion, intensity_level, trigger_factor, coping_strategy
		FROM mood_entry
		WHERE user_id = $1
	`

	// Add filters if provided
	if hasStartDate {
		query += " AND recorder_at >= $" + strconv.Itoa(argIndex-argIndex+2)
	}
	if hasEndDate {
		query += " AND recorder_at <= $" + strconv.Itoa(argIndex-argIndex+3)
	}
	if hasEntryType {
		query += " AND entry_type = $" + strconv.Itoa(argIndex-argIndex+4)
	}

	query += " ORDER BY recorder_at DESC LIMIT $" + strconv.Itoa(argIndex-argIndex+5) + " OFFSET $" + strconv.Itoa(argIndex-argIndex+6)
	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var entries []*domain.MoodEntry
	for rows.Next() {
		var entry domain.MoodEntry
		err := rows.Scan(
			&entry.ID,
			&entry.UserID,
			&entry.JournalID,
			&entry.EntryType,
			&entry.RecordedAt,
			&entry.PrimaryEmotion,
			&entry.IntensityLevel,
			&entry.TriggerFactor,
			&entry.CopingStrategy,
		)
		if err != nil {
			return nil, 0, err
		}
		entries = append(entries, &entry)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	return entries, totalCount, nil
}
