package postgres

import (
	"database/sql"

	"warasin/internal/domain"
)

type paymentRepository struct {
	db *sql.DB
}

// PaymentRepository interface
type PaymentRepository interface {
	Create(payment *domain.Payment) (*domain.Payment, error)
	GetByUserID(userID int, limit, offset int, status string) ([]*domain.Payment, int, error)
	GetByID(id int, userID int) (*domain.Payment, error)
	UpdateStatus(id int, userID int, status string) error
}

// NewPaymentRepository creates a new payment repository
func NewPaymentRepository(db *sql.DB) PaymentRepository {
	return &paymentRepository{
		db: db,
	}
}

func (r *paymentRepository) Create(payment *domain.Payment) (*domain.Payment, error) {
	query := `
		INSERT INTO payment (user_id, premium_type, payment_at, status)
		VALUES ($1, $2, $3, $4)
		RETURNING payment_id
	`

	err := r.db.QueryRow(
		query,
		payment.UserID,
		payment.PremiumType,
		payment.PaymentAt,
		payment.Status,
	).Scan(&payment.ID)

	if err != nil {
		return nil, err
	}

	return payment, nil
}

func (r *paymentRepository) GetByUserID(userID int, limit, offset int, status string) ([]*domain.Payment, int, error) {
	// Get total count
	countQuery := `
		SELECT COUNT(*)
		FROM payment
		WHERE user_id = $1
	`

	args := []interface{}{userID}

	// Add status filter if provided
	if status != "" {
		countQuery += " AND status = $2"
		args = append(args, status)
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
		SELECT payment_id, user_id, premium_type, payment_at, status
		FROM payment
		WHERE user_id = $1
	`

	// Add status filter if provided
	if status != "" {
		query += " AND status = $2"
	}

	query += " ORDER BY payment_at DESC LIMIT $"
	if status != "" {
		query += "3 OFFSET $4"
		args = append(args, limit, offset)
	} else {
		query += "2 OFFSET $3"
		args = append(args, limit, offset)
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var payments []*domain.Payment
	for rows.Next() {
		var payment domain.Payment
		err := rows.Scan(
			&payment.ID,
			&payment.UserID,
			&payment.PremiumType,
			&payment.PaymentAt,
			&payment.Status,
		)
		if err != nil {
			return nil, 0, err
		}
		payments = append(payments, &payment)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	return payments, totalCount, nil
}

func (r *paymentRepository) GetByID(id int, userID int) (*domain.Payment, error) {
	var payment domain.Payment

	query := `
		SELECT payment_id, user_id, premium_type, payment_at, status
		FROM payment
		WHERE payment_id = $1 AND user_id = $2
	`

	err := r.db.QueryRow(query, id, userID).Scan(
		&payment.ID,
		&payment.UserID,
		&payment.PremiumType,
		&payment.PaymentAt,
		&payment.Status,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &payment, nil
}

func (r *paymentRepository) UpdateStatus(id int, userID int, status string) error {
	query := `
		UPDATE payment
		SET status = $3
		WHERE payment_id = $1 AND user_id = $2
	`

	result, err := r.db.Exec(query, id, userID, status)
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
