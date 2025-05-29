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
	GoogleLogin(googleUserInfo *domain.GoogleUserInfo) (*domain.User, error)
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

	// Set auth provider
	if user.AuthProvider == "" {
		user.AuthProvider = "local"
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

	// Check if user is using Google OAuth
	if user.AuthProvider == "google" {
		return nil, errors.New("please login with Google")
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	return user, nil
}

func (u *userUsecase) GoogleLogin(googleUserInfo *domain.GoogleUserInfo) (*domain.User, error) {
	// Check if user exists by Google ID
	existingUser, err := u.userRepo.GetByGoogleID(googleUserInfo.ID)
	if err != nil {
		return nil, err
	}

	if existingUser != nil {
		// User exists, update their info and return
		existingUser.Name = googleUserInfo.Name
		existingUser.Avatar = googleUserInfo.Picture
		err = u.userRepo.Update(existingUser)
		if err != nil {
			return nil, err
		}
		return existingUser, nil
	}

	// Check if user exists by email (linking accounts)
	existingUserByEmail, err := u.userRepo.GetByEmail(googleUserInfo.Email)
	if err != nil {
		return nil, err
	}

	if existingUserByEmail != nil {
		// Email exists but with different auth provider
		if existingUserByEmail.AuthProvider == "local" {
			return nil, errors.New("email already registered with password. Please login with email and password")
		}
	}

	// Create new user from Google info
	newUser := &domain.User{
		Email:        googleUserInfo.Email,
		Name:         googleUserInfo.Name,
		GoogleID:     googleUserInfo.ID,
		Avatar:       googleUserInfo.Picture,
		UserType:     "standard",
		AuthProvider: "google",
	}

	return u.userRepo.CreateFromGoogle(newUser)
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

	// Check if user is using Google OAuth
	if user.AuthProvider == "google" {
		return errors.New("cannot change password for Google OAuth users")
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(currentPassword))
	if err != nil {
		return errors.New("current password is incorrect")
	}

	return u.userRepo.ChangePassword(id, newPassword)
}
