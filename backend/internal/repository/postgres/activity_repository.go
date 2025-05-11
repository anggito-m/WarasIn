package postgres

import (
	"database/sql"
	"time"

	"warasin/internal/domain"
)

type activityRepository struct {
	db *sql.DB
}

// ActivityRepository interface
type ActivityRepository interface {
	LogActivity(log *domain.ActivityLog) error
	GetByUserID(userID int, limit, offset int, startDate, endDate time.Time, activity string) ([]*domain.ActivityLog, int, error)
}

// NewActivityRepository creates a new activity repository
func NewActivityRepository(db *sql.DB) ActivityRepository {
	return &activityRepository{
		db: db,
	}
}

func (r *activityRepository) LogActivity(log *domain.ActivityLog) error {
	query := `
		INSERT INTO activity_log (user_id, activity, timestamp, ip_address, device_info, browser_info)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING log_id
	`

	err := r.db.QueryRow(
		query,
		log.UserID,
		log.Activity,
		time.Now(),
		log.IPAddress,
		log.DeviceInfo,
		log.BrowserInfo,
	).Scan(&log.LogID)

	return err
}

func (r *activityRepository) GetByUserID(userID int, limit, offset int, startDate, endDate time.Time, activity string) ([]*domain.ActivityLog, int, error) {
	// Get total count
	countQuery := `
		SELECT COUNT(*)
		FROM activity_log
		WHERE user_id = $1
	`

	args := []interface{}{userID}
	argIndex := 2

	// Add filters if provided
	hasStartDate := !startDate.IsZero()
	hasEndDate := !endDate.IsZero()
	hasActivity := activity != ""

	if hasStartDate {
		countQuery += " AND timestamp >= $" + "2"
		args = append(args, startDate)
		argIndex++
	}
	if hasEndDate {
		countQuery += " AND timestamp <= $" + "3"
		args = append(args, endDate)
		argIndex++
	}
	if hasActivity {
		countQuery += " AND activity = $" + "4"
		args = append(args, activity)
		argIndex++
	}

	var totalCount int
	err := r.db.QueryRow(countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	if limit <= 0 {
		limit = 20 // Default limit
	}

	query := `
		SELECT log_id, user_id, activity, timestamp, ip_address, device_info, browser_info
		FROM activity_log
		WHERE user_id = $1
	`

	// Add filters if provided
	if hasStartDate {
		query += " AND timestamp >= $2"
	}
	if hasEndDate {
		query += " AND timestamp <= $3"
	}
	if hasActivity {
		query += " AND activity = $4"
	}

	query += " ORDER BY timestamp DESC LIMIT $5 OFFSET $6"
	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var logs []*domain.ActivityLog
	for rows.Next() {
		var log domain.ActivityLog
		err := rows.Scan(
			&log.LogID,
			&log.UserID,
			&log.Activity,
			&log.Timestamp,
			&log.IPAddress,
			&log.DeviceInfo,
			&log.BrowserInfo,
		)
		if err != nil {
			return nil, 0, err
		}
		logs = append(logs, &log)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	return logs, totalCount, nil
}
