package postgres

import (
	"database/sql"
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

func (r *journalRepository) Create(journal *domain.Journal) (*domain.Journal, error) {
	now := time.Now()
	query := `
		INSERT INTO journal (user_id, content, created_at, updated_at)
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
		FROM journal
		WHERE journal_id = $1 AND user_id = $2
	`

	row := r.db.QueryRow(query, id, userID)
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
		return nil, err
	}

	return &journal, nil
}

func (r *journalRepository) GetByUserID(userID int, limit, offset int, startDate, endDate time.Time) ([]*domain.Journal, int, error) {
	// Get total count
	var totalCount int
	countQuery := `
		SELECT COUNT(*)
		FROM journal
		WHERE user_id = $1
	`

	// Add date filters if provided
	hasStartDate := !startDate.IsZero()
	hasEndDate := !endDate.IsZero()

	if hasStartDate {
		countQuery += " AND created_at >= $2"
	}
	if hasEndDate {
		if hasStartDate {
			countQuery += " AND created_at <= $3"
		} else {
			countQuery += " AND created_at <= $2"
		}
	}

	var countErr error
	if hasStartDate && hasEndDate {
		countErr = r.db.QueryRow(countQuery, userID, startDate, endDate).Scan(&totalCount)
	} else if hasStartDate {
		countErr = r.db.QueryRow(countQuery, userID, startDate).Scan(&totalCount)
	} else if hasEndDate {
		countErr = r.db.QueryRow(countQuery, userID, endDate).Scan(&totalCount)
	} else {
		countErr = r.db.QueryRow(countQuery, userID).Scan(&totalCount)
	}

	if countErr != nil {
		return nil, 0, countErr
	}

	// Get paginated results
	if limit <= 0 {
		limit = 10 // Default limit
	}

	query := `
		SELECT journal_id, user_id, content, created_at, updated_at
		FROM journal
		WHERE user_id = $1
	`

	// Add date filters if provided
	if hasStartDate {
		query += " AND created_at >= $2"
	}
	if hasEndDate {
		if hasStartDate {
			query += " AND created_at <= $3"
		} else {
			query += " AND created_at <= $2"
		}
	}

	query += " ORDER BY created_at DESC LIMIT $4 OFFSET $5"

	var rows *sql.Rows
	var err error

	if hasStartDate && hasEndDate {
		rows, err = r.db.Query(query, userID, startDate, endDate, limit, offset)
	} else if hasStartDate {
		rows, err = r.db.Query(query, userID, startDate, limit, offset)
	} else if hasEndDate {
		rows, err = r.db.Query(query, userID, endDate, limit, offset)
	} else {
		rows, err = r.db.Query(query, userID, limit, offset)
	}

	if err != nil {
		return nil, 0, err
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
			return nil, 0, err
		}
		journals = append(journals, &journal)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	return journals, totalCount, nil
}

func (r *journalRepository) Update(journal *domain.Journal) error {
	now := time.Now()
	query := `
		UPDATE journal
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
