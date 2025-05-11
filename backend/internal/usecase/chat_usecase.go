package usecase

import (
	"errors"
	"time"

	"warasin/internal/domain"
	"warasin/internal/repository/postgres"
)

type chatUsecase struct {
	chatRepo postgres.ChatRepository
}

// ChatUsecase interface
type ChatUsecase interface {
	StartSession(userID int) (*domain.ChatSession, error)
	EndSession(sessionID, userID int) (*domain.ChatSession, error)
	GetSessions(userID int, limit, offset int, startDate, endDate string) ([]*domain.ChatSession, int, error)
	SendMessage(sessionID, userID int, content, senderType string) (*domain.ChatMessage, error)
	GetMessages(sessionID, userID int, limit, beforeID int) ([]*domain.ChatMessage, int, error)
}

// NewChatUsecase creates a new chat use case
func NewChatUsecase(chatRepo postgres.ChatRepository) ChatUsecase {
	return &chatUsecase{
		chatRepo: chatRepo,
	}
}

func (u *chatUsecase) StartSession(userID int) (*domain.ChatSession, error) {
	session := &domain.ChatSession{
		UserID:    userID,
		StartTime: time.Now(),
	}

	return u.chatRepo.CreateSession(session)
}

func (u *chatUsecase) EndSession(sessionID, userID int) (*domain.ChatSession, error) {
	// Get current session
	session, err := u.chatRepo.GetSessionByID(sessionID, userID)
	if err != nil {
		return nil, err
	}

	if session == nil {
		return nil, errors.New("session not found")
	}

	if session.EndTime != nil {
		return nil, errors.New("session already ended")
	}

	// End session
	endTime := time.Now()
	err = u.chatRepo.EndSession(sessionID, userID, endTime)
	if err != nil {
		return nil, err
	}

	session.EndTime = &endTime
	return session, nil
}

func (u *chatUsecase) GetSessions(userID int, limit, offset int, startDateStr, endDateStr string) ([]*domain.ChatSession, int, error) {
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

	return u.chatRepo.GetSessionsByUserID(userID, limit, offset, startDate, endDate)
}

func (u *chatUsecase) SendMessage(sessionID, userID int, content, senderType string) (*domain.ChatMessage, error) {
	// Validate sender type
	if senderType != "user" && senderType != "bot" {
		return nil, errors.New("invalid sender type")
	}

	// Check if session exists and belongs to user
	session, err := u.chatRepo.GetSessionByID(sessionID, userID)
	if err != nil {
		return nil, err
	}

	if session == nil {
		return nil, errors.New("session not found")
	}

	// Check if session is still active
	if session.EndTime != nil {
		return nil, errors.New("cannot send message to ended session")
	}

	message := &domain.ChatMessage{
		SessionID:      sessionID,
		MessageContent: content,
		SentAt:         time.Now(),
		SenderType:     senderType,
	}

	return u.chatRepo.CreateMessage(message)
}

func (u *chatUsecase) GetMessages(sessionID, userID int, limit, beforeID int) ([]*domain.ChatMessage, int, error) {
	// Check if session exists and belongs to user
	session, err := u.chatRepo.GetSessionByID(sessionID, userID)
	if err != nil {
		return nil, 0, err
	}

	if session == nil {
		return nil, 0, errors.New("session not found")
	}

	return u.chatRepo.GetMessagesBySessionID(sessionID, limit, beforeID)
}
