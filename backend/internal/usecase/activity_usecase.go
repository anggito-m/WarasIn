package usecase

import (
	"errors"
	"time"

	"warasin/internal/domain"
	"warasin/internal/repository/postgres"
)

type activityUsecase struct {
	activityRepo postgres.ActivityRepository
}

// ActivityUsecase interface
type ActivityUsecase interface {
	LogActivity(userID int, activity, ipAddress, deviceInfo, browserInfo string) error
	GetActivityHistory(userID int, limit, offset int, startDate, endDate, activity string) ([]*domain.ActivityLog, int, error)
}

// NewActivityUsecase creates a new activity use case
func NewActivityUsecase(activityRepo postgres.ActivityRepository) ActivityUsecase {
	return &activityUsecase{
		activityRepo: activityRepo,
	}
}

func (u *activityUsecase) LogActivity(userID int, activity, ipAddress, deviceInfo, browserInfo string) error {
	log := &domain.ActivityLog{
		UserID:      userID,
		Activity:    activity,
		Timestamp:   time.Now(),
		IPAddress:   ipAddress,
		DeviceInfo:  deviceInfo,
		BrowserInfo: browserInfo,
	}

	return u.activityRepo.LogActivity(log)
}

func (u *activityUsecase) GetActivityHistory(userID int, limit, offset int, startDateStr, endDateStr, activity string) ([]*domain.ActivityLog, int, error) {
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

	return u.activityRepo.GetByUserID(userID, limit, offset, startDate, endDate, activity)
}
