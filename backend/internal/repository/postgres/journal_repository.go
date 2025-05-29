package postgres

import (
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"warasin/internal/domain"
)

type journalRepository struct {
	db *sql.DB
}

// JournalRepository interface
type JournalRepository interface {
	Create(journal *domain.Journal) (*domain.Journal, error)
	GetByID(id int, userID int) (*domain.Journal, error)
	GetByUserID(userID int, limit, offset int, startDate, endDate time.Time) ([]*domain.Journal, int, error)
	Update(journal *domain.Journal) error
	Delete(id int, userID int) error
}

// NewJournalRepository creates a new journal repository
func NewJournalRepository(db *sql.DB) JournalRepository {
	return &journalRepository{
		db: db,
	}
}

func logArgsWithTypes(args []interface{}) string {
	var loggedArgs []string
	for i, arg := range args {
		loggedArgs = append(loggedArgs, fmt.Sprintf("$%d: %v (%T)", i+1, arg, arg))
	}
	return strings.Join(loggedArgs, ", ")
}

func (r *journalRepository) Create(journal *domain.Journal) (*domain.Journal, error) {
	now := time.Now()
	query := `
		INSERT INTO journals (user_id, content, created_at, updated_at)
		VALUES ($1, $2, $3, $4)
		RETURNING journal_id
	`

	err := r.db.QueryRow(
		query,
		journal.UserID,
		journal.Content,
		now,
		now,
	).Scan(&journal.ID)

	if err != nil {
		return nil, err
	}

	journal.CreatedAt = now
	journal.UpdatedAt = now

	return journal, nil
}

func (r *journalRepository) GetByID(id int, userID int) (*domain.Journal, error) {
	var journal domain.Journal
	query := `
		SELECT journal_id, user_id, content, created_at, updated_at
		FROM journals
		WHERE journal_id = $1 AND user_id = $2
	`
	args := []interface{}{id, userID}
	log.Printf("DEBUG: GetByID Query: %s, Args: [%s]", query, logArgsWithTypes(args))
	row := r.db.QueryRow(query, args...)
	err := row.Scan(
		&journal.ID,
		&journal.UserID,
		&journal.Content,
		&journal.CreatedAt,
		&journal.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Journal not found
		}
		return nil, fmt.Errorf("error getting journal by id (Query: %s, Args: %v): %w", query, args, err)
	}
	return &journal, nil
}

func (r *journalRepository) GetByUserID(userID int, limit, offset int, startDate, endDate time.Time) ([]*domain.Journal, int, error) {
	var totalCount int
	countQueryBase := "SELECT COUNT(*) FROM journals WHERE user_id = $1"
	countArgs := []interface{}{userID}
	countQueryConditions := ""
	currentArgIdx := 2 // Start from $2 for conditional params

	hasStartDate := !startDate.IsZero()
	hasEndDate := !endDate.IsZero()

	if hasStartDate {
		countQueryConditions += " AND created_at >= $" + strconv.Itoa(currentArgIdx)
		countArgs = append(countArgs, startDate)
		currentArgIdx++
	}
	if hasEndDate {
		countQueryConditions += " AND created_at <= $" + strconv.Itoa(currentArgIdx)
		countArgs = append(countArgs, endDate)
		currentArgIdx++
	}
	finalCountQuery := countQueryBase + countQueryConditions

	log.Printf("DEBUG: Count Query: %s, Args: [%s]", finalCountQuery, logArgsWithTypes(countArgs))
	err := r.db.QueryRow(finalCountQuery, countArgs...).Scan(&totalCount)
	if err != nil {
		// Tambahkan detail query dan args ke pesan error
		return nil, 0, fmt.Errorf("error counting journals (Query: %s, Args: %v): %w", finalCountQuery, countArgs, err)
	}

	if limit <= 0 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	mainQueryBase := "SELECT journal_id, user_id, content, created_at, updated_at FROM journals WHERE user_id = $1"
	mainArgs := []interface{}{userID}
	mainQueryConditions := ""
	currentArgIdx = 2 // Reset for main query conditional params

	if hasStartDate {
		mainQueryConditions += " AND created_at >= $" + strconv.Itoa(currentArgIdx)
		mainArgs = append(mainArgs, startDate)
		currentArgIdx++
	}
	if hasEndDate {
		mainQueryConditions += " AND created_at <= $" + strconv.Itoa(currentArgIdx)
		mainArgs = append(mainArgs, endDate)
		currentArgIdx++
	}

	orderByLimitOffset := " ORDER BY created_at DESC LIMIT $" + strconv.Itoa(currentArgIdx)
	mainArgs = append(mainArgs, limit)
	currentArgIdx++
	orderByLimitOffset += " OFFSET $" + strconv.Itoa(currentArgIdx)
	mainArgs = append(mainArgs, offset)

	finalMainQuery := mainQueryBase + mainQueryConditions + orderByLimitOffset

	log.Printf("DEBUG: Main Query: %s, Args: [%s]", finalMainQuery, logArgsWithTypes(mainArgs))
	rows, err := r.db.Query(finalMainQuery, mainArgs...)
	if err != nil {
		// Tambahkan detail query dan args ke pesan error
		return nil, 0, fmt.Errorf("error querying journals (Query: %s, Args: %v): %w", finalMainQuery, mainArgs, err)
	}
	defer rows.Close()

	var journals []*domain.Journal
	for rows.Next() {
		var journal domain.Journal
		err := rows.Scan(
			&journal.ID,
			&journal.UserID,
			&journal.Content,
			&journal.CreatedAt,
			&journal.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("error scanning journal row: %w", err)
		}
		journals = append(journals, &journal)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating journal rows: %w", err)
	}

	return journals, totalCount, nil
}

func (r *journalRepository) Update(journal *domain.Journal) error {
	now := time.Now()
	query := `
		UPDATE journals
		SET content = $3, updated_at = $4
		WHERE journal_id = $1 AND user_id = $2
	`

	result, err := r.db.Exec(query, journal.ID, journal.UserID, journal.Content, now)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	journal.UpdatedAt = now
	return nil
}

func (r *journalRepository) Delete(id int, userID int) error {
	query := `
		DELETE FROM journal
		WHERE journal_id = $1 AND user_id = $2
	`

	result, err := r.db.Exec(query, id, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}
