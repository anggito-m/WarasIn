package usecase

import (
	"errors"
	"time"

	"warasin/internal/domain"
	"warasin/internal/repository/postgres"
)

type paymentUsecase struct {
	paymentRepo postgres.PaymentRepository
	userRepo    postgres.UserRepository
}

// PaymentUsecase interface
type PaymentUsecase interface {
	CreatePayment(userID int, premiumType, paymentMethod string, amount float64) (*domain.Payment, error)
	GetPaymentHistory(userID int, limit, offset int, status string) ([]*domain.Payment, int, error)
	ProcessPayment(paymentID, userID int) error
}

// NewPaymentUsecase creates a new payment use case
func NewPaymentUsecase(paymentRepo postgres.PaymentRepository, userRepo postgres.UserRepository) PaymentUsecase {
	return &paymentUsecase{
		paymentRepo: paymentRepo,
		userRepo:    userRepo,
	}
}

func (u *paymentUsecase) CreatePayment(userID int, premiumType, paymentMethod string, amount float64) (*domain.Payment, error) {
	// Validate premium type
	if premiumType != "monthly" && premiumType != "yearly" {
		return nil, errors.New("invalid premium type")
	}

	// Validate payment method
	if paymentMethod != "credit_card" && paymentMethod != "paypal" {
		return nil, errors.New("invalid payment method")
	}

	// Validate amount
	if amount <= 0 {
		return nil, errors.New("amount must be greater than 0")
	}

	// Create payment
	payment := &domain.Payment{
		UserID:      userID,
		PremiumType: premiumType,
		PaymentAt:   time.Now(),
		Status:      "pending", // Initially pending until processed
	}

	payment, err := u.paymentRepo.Create(payment)
	if err != nil {
		return nil, err
	}

	// In a real application, here you would integrate with a payment gateway
	// For now, we'll simulate a successful payment
	err = u.ProcessPayment(payment.ID, userID)
	if err != nil {
		return nil, err
	}

	return payment, nil
}

func (u *paymentUsecase) GetPaymentHistory(userID int, limit, offset int, status string) ([]*domain.Payment, int, error) {
	return u.paymentRepo.GetByUserID(userID, limit, offset, status)
}

func (u *paymentUsecase) ProcessPayment(paymentID, userID int) error {
	// Get payment
	payment, err := u.paymentRepo.GetByID(paymentID, userID)
	if err != nil {
		return err
	}

	if payment == nil {
		return errors.New("payment not found")
	}

	// In a real application, here you would process the payment with a payment gateway
	// For now, we'll simulate a successful payment

	// Update payment status
	err = u.paymentRepo.UpdateStatus(paymentID, userID, "completed")
	if err != nil {
		return err
	}

	// Get user
	user, err := u.userRepo.GetByID(userID)
	if err != nil {
		return err
	}

	if user == nil {
		return errors.New("user not found")
	}

	// Update user type to premium
	user.UserType = "premium"
	err = u.userRepo.Update(user)
	if err != nil {
		return err
	}

	return nil
}
