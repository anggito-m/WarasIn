package auth

import (
	"errors"
	"fmt"
	"time"

	"warasin/internal/domain"

	"github.com/golang-jwt/jwt/v4"
)

// JWTClaims contains the claims we want to store in the token
type JWTClaims struct {
	UserID   int    `json:"user_id"`
	Email    string `json:"email"`
	UserType string `json:"user_type"`
	jwt.RegisteredClaims
}

// JWTService interface for JWT operations
type JWTService interface {
	GenerateToken(user *domain.User) (string, time.Time, error)
	ValidateToken(tokenString string) (*JWTClaims, error)
}

// jwtService implements JWTService
type jwtService struct {
	secretKey string
	expiresIn time.Duration
}

// NewJWTService creates a new JWT service
func NewJWTService(secretKey string, expiresIn time.Duration) JWTService {
	return &jwtService{
		secretKey: secretKey,
		expiresIn: expiresIn,
	}
}

// GenerateToken generates a JWT token for the user
func (j *jwtService) GenerateToken(user *domain.User) (string, time.Time, error) {
	expiresAt := time.Now().Add(j.expiresIn)

	claims := &JWTClaims{
		UserID:   user.ID,
		Email:    user.Email,
		UserType: user.UserType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(j.secretKey))
	if err != nil {
		return "", time.Time{}, err
	}

	return signedToken, expiresAt, nil
}

// ValidateToken validates and parses the JWT token
func (j *jwtService) ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(j.secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
