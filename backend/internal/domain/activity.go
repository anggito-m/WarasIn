package domain

import (
	"time"
)

type ActivityLog struct {
	LogID       int       `json:"log_id"`
	UserID      int       `json:"user_id"`
	Activity    string    `json:"activity"`
	Timestamp   time.Time `json:"timestamp"`
	IPAddress   string    `json:"ip_address"`
	DeviceInfo  string    `json:"device_info"`
	BrowserInfo string    `json:"browser_info"`
}
