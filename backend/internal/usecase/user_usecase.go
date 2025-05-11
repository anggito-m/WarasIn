package usecase

import (
	"errors"
	"warasin/internal/domain"
	"warasin/internal/repository/postgres"

	"golang.org/x/crypto/bcrypt"
)

type userUsecase struct {
	userRepo postgres.UserRepository
}

// UserUsecase interface
type UserUsecase interface {
	Register(user *domain.User) (*domain.User, error)
	Login(email, password string) (*domain.User, error)
	GetProfile(id int) (*domain.User, error)
	UpdateProfile(user *domain.User) error
	ChangePassword(id int, currentPassword, newPassword string) error
}

// NewUserUsecase creates a new user use case
func NewUserUsecase(userRepo postgres.UserRepository) UserUsecase {
	return &userUsecase{
		userRepo: userRepo,
	}
}

func (u *userUsecase) Register(user *domain.User) (*domain.User, error) {
	// Check if email already exists
	existingUser, err := u.userRepo.GetByEmail(user.Email)
	if err != nil {
		return nil, err
	}

	if existingUser != nil {
		return nil, errors.New("email already exists")
	}

	// Set default user type if not provided
	if user.UserType == "" {
		user.UserType = "standard"
	}

	return u.userRepo.Create(user)
}

func (u *userUsecase) Login(email, password string) (*domain.User, error) {
	user, err := u.userRepo.GetByEmail(email)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, errors.New("invalid email or password")
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	return user, nil
}

func (u *userUsecase) GetProfile(id int) (*domain.User, error) {
	return u.userRepo.GetByID(id)
}

func (u *userUsecase) UpdateProfile(user *domain.User) error {
	return u.userRepo.Update(user)
}

func (u *userUsecase) ChangePassword(id int, currentPassword, newPassword string) error {
	user, err := u.userRepo.GetByID(id)
	if err != nil {
		return err
	}

	if user == nil {
		return errors.New("user not found")
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(currentPassword))
	if err != nil {
		return errors.New("current password is incorrect")
	}

	return u.userRepo.ChangePassword(id, newPassword)
}
