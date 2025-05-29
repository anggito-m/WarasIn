package postgres

import (
	"database/sql"
	"time"

	"warasin/internal/domain"
)

type chatRepository struct {
	db *sql.DB
}

// ChatRepository interface
type ChatRepository interface {
	CreateSession(session *domain.ChatSession) (*domain.ChatSession, error)
	EndSession(sessionID, userID int, endTime time.Time) error
	GetSessionByID(sessionID, userID int) (*domain.ChatSession, error)
	GetSessionsByUserID(userID int, limit, offset int, startDate, endDate time.Time) ([]*domain.ChatSession, int, error)
	CreateMessage(message *domain.ChatMessage) (*domain.ChatMessage, error)
	GetMessagesBySessionID(sessionID int, limit int, beforeID int) ([]*domain.ChatMessage, int, error)
}

// NewChatRepository creates a new chat repository
func NewChatRepository(db *sql.DB) ChatRepository {
	return &chatRepository{
		db: db,
	}
}

func (r *chatRepository) CreateSession(session *domain.ChatSession) (*domain.ChatSession, error) {
	query := `
		INSERT INTO chat_sessions (user_id, start_time)
		VALUES ($1, $2)
		RETURNING session_id
	`

	err := r.db.QueryRow(
		query,
		session.UserID,
		time.Now(),
	).Scan(&session.ID)

	if err != nil {
		return nil, err
	}

	return session, nil
}

func (r *chatRepository) EndSession(sessionID, userID int, endTime time.Time) error {
	query := `
		UPDATE chat_sessions
		SET end_time = $3
		WHERE session_id = $1 AND user_id = $2 AND end_time IS NULL
	`

	result, err := r.db.Exec(query, sessionID, userID, endTime)
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

func (r *chatRepository) GetSessionByID(sessionID, userID int) (*domain.ChatSession, error) {
	var session domain.ChatSession
	var endTime sql.NullTime

	query := `
		SELECT session_id, user_id, start_time, end_time
		FROM chat_sessions
		WHERE session_id = $1 AND user_id = $2
	`

	err := r.db.QueryRow(query, sessionID, userID).Scan(
		&session.ID,
		&session.UserID,
		&session.StartTime,
		&endTime,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if endTime.Valid {
		session.EndTime = &endTime.Time
	}

	return &session, nil
}

func (r *chatRepository) GetSessionsByUserID(userID int, limit, offset int, startDate, endDate time.Time) ([]*domain.ChatSession, int, error) {
	// Get total count
	countQuery := `
		SELECT COUNT(*)
		FROM chat_sessions
		WHERE user_id = $1
	`

	args := []interface{}{userID}
	argIndex := 2

	// Add date filters if provided
	hasStartDate := !startDate.IsZero()
	hasEndDate := !endDate.IsZero()

	if hasStartDate {
		countQuery += " AND start_time >= $" + "2"
		args = append(args, startDate)
		argIndex++
	}
	if hasEndDate {
		countQuery += " AND start_time <= $" + "3"
		args = append(args, endDate)
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
		SELECT session_id, user_id, start_time, end_time
		FROM chat_sessions
		WHERE user_id = $1
	`

	// Add date filters if provided
	if hasStartDate {
		query += " AND start_time >= $2"
	}
	if hasEndDate {
		query += " AND start_time <= $3"
	}

	query += " ORDER BY start_time DESC LIMIT $4 OFFSET $5"
	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var sessions []*domain.ChatSession
	for rows.Next() {
		var session domain.ChatSession
		var endTime sql.NullTime

		err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.StartTime,
			&endTime,
		)
		if err != nil {
			return nil, 0, err
		}

		if endTime.Valid {
			session.EndTime = &endTime.Time
		}

		sessions = append(sessions, &session)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	return sessions, totalCount, nil
}

func (r *chatRepository) CreateMessage(message *domain.ChatMessage) (*domain.ChatMessage, error) {
	query := `
		INSERT INTO chat_messages (session_id, message_content, sent_at, sender_type)
		VALUES ($1, $2, $3, $4)
		RETURNING message_id
	`

	err := r.db.QueryRow(
		query,
		message.SessionID,
		message.MessageContent,
		time.Now(),
		message.SenderType,
	).Scan(&message.ID)

	if err != nil {
		return nil, err
	}

	return message, nil
}

func (r *chatRepository) GetMessagesBySessionID(sessionID int, limit int, beforeID int) ([]*domain.ChatMessage, int, error) {
	// Get total count
	countQuery := `
		SELECT COUNT(*)
		FROM chat_messages
		WHERE session_id = $1
	`

	if beforeID > 0 {
		countQuery += " AND message_id < $2"
	}

	var totalCount int
	var err error
	if beforeID > 0 {
		err = r.db.QueryRow(countQuery, sessionID, beforeID).Scan(&totalCount)
	} else {
		err = r.db.QueryRow(countQuery, sessionID).Scan(&totalCount)
	}

	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	if limit <= 0 {
		limit = 50 // Default limit
	}

	query := `
		SELECT message_id, session_id, message_content, sent_at, sender_type
		FROM chat_messages
		WHERE session_id = $1
	`

	args := []interface{}{sessionID}

	if beforeID > 0 {
		query += " AND message_id < $2"
		args = append(args, beforeID)
	}

	query += " ORDER BY sent_at DESC LIMIT $"
	if beforeID > 0 {
		query += "3"
	} else {
		query += "2"
	}
	args = append(args, limit)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var messages []*domain.ChatMessage
	for rows.Next() {
		var message domain.ChatMessage
		err := rows.Scan(
			&message.ID,
			&message.SessionID,
			&message.MessageContent,
			&message.SentAt,
			&message.SenderType,
		)
		if err != nil {
			return nil, 0, err
		}
		messages = append(messages, &message)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	return messages, totalCount, nil
}
