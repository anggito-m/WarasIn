package postgres

import (
	"database/sql"
	"strconv"

	"warasin/internal/domain"
)

type resourceRepository struct {
	db *sql.DB
}

// ResourceRepository interface
type ResourceRepository interface {
	GetResources(userType, contentType, language string, limit, offset int) ([]*domain.Resource, int, error)
	GetByID(id int) (*domain.Resource, error)
	IncrementViewCount(id int) error
	CreateInteraction(interaction *domain.ResourceInteraction) (*domain.ResourceInteraction, error)
	GetInteractionsByResourceID(resourceID int, limit, offset int) ([]*domain.ResourceInteraction, int, error)
	GetInteractionByUserAndResource(userID, resourceID int) (*domain.ResourceInteraction, error)
	UpdateInteraction(interaction *domain.ResourceInteraction) error
}

// NewResourceRepository creates a new resource repository
func NewResourceRepository(db *sql.DB) ResourceRepository {
	return &resourceRepository{
		db: db,
	}
}

func (r *resourceRepository) GetResources(userType, contentType, language string, limit, offset int) ([]*domain.Resource, int, error) {
	// Get total count
	countQuery := `
		SELECT COUNT(*)
		FROM resource
		WHERE 1=1
	`

	args := []interface{}{}
	argIndex := 1

	// Add filters if provided
	if userType != "" {
		countQuery += " AND user_type = $" + strconv.Itoa(argIndex)
		args = append(args, userType)
		argIndex++
	}
	if contentType != "" {
		countQuery += " AND content_type = $" + strconv.Itoa(argIndex)
		args = append(args, contentType)
		argIndex++
	}
	if language != "" {
		countQuery += " AND language = $" + strconv.Itoa(argIndex)
		args = append(args, language)
		argIndex++
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
		SELECT resource_id, title, content, published_at, language, user_type, view_count, content_type
		FROM resource
		WHERE 1=1
	`

	// Add filters if provided
	if userType != "" {
		query += " AND user_type = $" + strconv.Itoa(argIndex-argIndex+1)
	}
	if contentType != "" {
		query += " AND content_type = $" + strconv.Itoa(argIndex-argIndex+2)
	}
	if language != "" {
		query += " AND language = $" + strconv.Itoa(argIndex-argIndex+3)
	}

	query += " ORDER BY published_at DESC LIMIT $" + strconv.Itoa(argIndex) + " OFFSET $" + strconv.Itoa(argIndex+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var resources []*domain.Resource
	for rows.Next() {
		var resource domain.Resource
		err := rows.Scan(
			&resource.ID,
			&resource.Title,
			&resource.Content,
			&resource.PublishedAt,
			&resource.Language,
			&resource.UserType,
			&resource.ViewCount,
			&resource.ContentType,
		)
		if err != nil {
			return nil, 0, err
		}
		resources = append(resources, &resource)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	return resources, totalCount, nil
}

func (r *resourceRepository) GetByID(id int) (*domain.Resource, error) {
	var resource domain.Resource

	query := `
		SELECT resource_id, title, content, published_at, language, user_type, view_count, content_type
		FROM resource
		WHERE resource_id = $1
	`

	err := r.db.QueryRow(query, id).Scan(
		&resource.ID,
		&resource.Title,
		&resource.Content,
		&resource.PublishedAt,
		&resource.Language,
		&resource.UserType,
		&resource.ViewCount,
		&resource.ContentType,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &resource, nil
}

func (r *resourceRepository) IncrementViewCount(id int) error {
	query := `
		UPDATE resource
		SET view_count = view_count + 1
		WHERE resource_id = $1
	`

	_, err := r.db.Exec(query, id)
	return err
}

func (r *resourceRepository) CreateInteraction(interaction *domain.ResourceInteraction) (*domain.ResourceInteraction, error) {
	query := `
		INSERT INTO resource_interaction (resource_id, user_id, rating, feedback_text)
		VALUES ($1, $2, $3, $4)
		RETURNING interaction_id
	`

	err := r.db.QueryRow(
		query,
		interaction.ResourceID,
		interaction.UserID,
		interaction.Rating,
		interaction.FeedbackText,
	).Scan(&interaction.ID)

	if err != nil {
		return nil, err
	}

	return interaction, nil
}

func (r *resourceRepository) GetInteractionsByResourceID(resourceID int, limit, offset int) ([]*domain.ResourceInteraction, int, error) {
	// Get total count
	countQuery := `
		SELECT COUNT(*)
		FROM resource_interaction
		WHERE resource_id = $1
	`

	var totalCount int
	err := r.db.QueryRow(countQuery, resourceID).Scan(&totalCount)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	if limit <= 0 {
		limit = 10 // Default limit
	}

	query := `
		SELECT interaction_id, resource_id, user_id, rating, feedback_text
		FROM resource_interaction
		WHERE resource_id = $1
		ORDER BY interaction_id DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(query, resourceID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var interactions []*domain.ResourceInteraction
	for rows.Next() {
		var interaction domain.ResourceInteraction
		err := rows.Scan(
			&interaction.ID,
			&interaction.ResourceID,
			&interaction.UserID,
			&interaction.Rating,
			&interaction.FeedbackText,
		)
		if err != nil {
			return nil, 0, err
		}
		interactions = append(interactions, &interaction)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	return interactions, totalCount, nil
}

func (r *resourceRepository) GetInteractionByUserAndResource(userID, resourceID int) (*domain.ResourceInteraction, error) {
	var interaction domain.ResourceInteraction

	query := `
		SELECT interaction_id, resource_id, user_id, rating, feedback_text
		FROM resource_interaction
		WHERE resource_id = $1 AND user_id = $2
	`

	err := r.db.QueryRow(query, resourceID, userID).Scan(
		&interaction.ID,
		&interaction.ResourceID,
		&interaction.UserID,
		&interaction.Rating,
		&interaction.FeedbackText,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &interaction, nil
}

func (r *resourceRepository) UpdateInteraction(interaction *domain.ResourceInteraction) error {
	query := `
		UPDATE resource_interaction
		SET rating = $3, feedback_text = $4
		WHERE interaction_id = $1 AND user_id = $2
	`

	result, err := r.db.Exec(query, interaction.ID, interaction.UserID, interaction.Rating, interaction.FeedbackText)
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
