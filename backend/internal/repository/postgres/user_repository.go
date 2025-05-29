package postgres

import (
	"database/sql"
	"time"

	"warasin/internal/domain"

	"golang.org/x/crypto/bcrypt"
)

type userRepository struct {
	db *sql.DB
}

// UserRepository interface
type UserRepository interface {
	Create(user *domain.User) (*domain.User, error)
	CreateFromGoogle(user *domain.User) (*domain.User, error)
	GetByID(id int) (*domain.User, error)
	GetByEmail(email string) (*domain.User, error)
	GetByGoogleID(googleID string) (*domain.User, error)
	Update(user *domain.User) error
	ChangePassword(id int, password string) error
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{
		db: db,
	}
}

func (r *userRepository) Create(user *domain.User) (*domain.User, error) {
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	query := `
		INSERT INTO users (email, name, hash_password, user_type, auth_provider, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING user_id
	`

	authProvider := user.AuthProvider
	if authProvider == "" {
		authProvider = "local"
	}

	err = r.db.QueryRow(
		query,
		user.Email,
		user.Name,
		string(hashedPassword),
		user.UserType,
		authProvider,
		time.Now(),
	).Scan(&user.ID)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *userRepository) CreateFromGoogle(user *domain.User) (*domain.User, error) {
	query := `
		INSERT INTO users (email, name, google_id, avatar, user_type, auth_provider, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING user_id
	`

	err := r.db.QueryRow(
		query,
		user.Email,
		user.Name,
		user.GoogleID,
		user.Avatar,
		user.UserType,
		"google",
		time.Now(),
	).Scan(&user.ID)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *userRepository) GetByID(id int) (*domain.User, error) {
	var user domain.User
	var hashPassword sql.NullString
	var googleID sql.NullString
	var avatar sql.NullString

	query := `
		SELECT user_id, email, name, hash_password, google_id, avatar, user_type, auth_provider, created_at
		FROM users
		WHERE user_id = $1
	`

	row := r.db.QueryRow(query, id)
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&hashPassword,
		&googleID,
		&avatar,
		&user.UserType,
		&user.AuthProvider,
		&user.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, err
	}

	// Handle nullable fields
	if hashPassword.Valid {
		user.Password = hashPassword.String
	}
	if googleID.Valid {
		user.GoogleID = googleID.String
	}
	if avatar.Valid {
		user.Avatar = avatar.String
	}

	return &user, nil
}

func (r *userRepository) GetByEmail(email string) (*domain.User, error) {
	var user domain.User
	var hashPassword sql.NullString
	var googleID sql.NullString
	var avatar sql.NullString

	query := `
		SELECT user_id, email, name, hash_password, google_id, avatar, user_type, auth_provider, created_at
		FROM users
		WHERE email = $1
	`

	row := r.db.QueryRow(query, email)
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&hashPassword,
		&googleID,
		&avatar,
		&user.UserType,
		&user.AuthProvider,
		&user.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, err
	}

	// Handle nullable fields
	if hashPassword.Valid {
		user.Password = hashPassword.String
	}
	if googleID.Valid {
		user.GoogleID = googleID.String
	}
	if avatar.Valid {
		user.Avatar = avatar.String
	}

	return &user, nil
}

func (r *userRepository) GetByGoogleID(googleID string) (*domain.User, error) {
	var user domain.User
	var hashPassword sql.NullString
	var avatar sql.NullString

	query := `
		SELECT user_id, email, name, hash_password, google_id, avatar, user_type, auth_provider, created_at
		FROM users
		WHERE google_id = $1
	`

	row := r.db.QueryRow(query, googleID)
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&hashPassword,
		&user.GoogleID,
		&avatar,
		&user.UserType,
		&user.AuthProvider,
		&user.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, err
	}

	// Handle nullable fields
	if hashPassword.Valid {
		user.Password = hashPassword.String
	}
	if avatar.Valid {
		user.Avatar = avatar.String
	}

	return &user, nil
}

func (r *userRepository) Update(user *domain.User) error {
	query := `
		UPDATE users
		SET name = $2, user_type = $3, avatar = $4
		WHERE user_id = $1
	`

	_, err := r.db.Exec(query, user.ID, user.Name, user.UserType, user.Avatar)
	return err
}

func (r *userRepository) ChangePassword(id int, password string) error {
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	query := `
		UPDATE users
		SET hash_password = $2
		WHERE user_id = $1
	`

	_, err = r.db.Exec(query, id, string(hashedPassword))
	return err
}
