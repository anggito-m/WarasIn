package usecase

import (
	"errors"

	"warasin/internal/domain"
	"warasin/internal/repository/postgres"
)

type resourceUsecase struct {
	resourceRepo postgres.ResourceRepository
}

// ResourceUsecase interface
type ResourceUsecase interface {
	GetResources(userType, contentType, language string, limit, offset int) ([]*domain.Resource, int, error)
	GetResourceDetails(id int) (*domain.Resource, error)
	CreateInteraction(userID, resourceID int, rating float64, feedbackText string) (*domain.ResourceInteraction, error)
	GetInteractions(resourceID int, limit, offset int) ([]*domain.ResourceInteraction, int, error)
}

// NewResourceUsecase creates a new resource use case
func NewResourceUsecase(resourceRepo postgres.ResourceRepository) ResourceUsecase {
	return &resourceUsecase{
		resourceRepo: resourceRepo,
	}
}

func (u *resourceUsecase) GetResources(userType, contentType, language string, limit, offset int) ([]*domain.Resource, int, error) {
	return u.resourceRepo.GetResources(userType, contentType, language, limit, offset)
}

func (u *resourceUsecase) GetResourceDetails(id int) (*domain.Resource, error) {
	resource, err := u.resourceRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if resource == nil {
		return nil, errors.New("resource not found")
	}

	// Increment view count
	err = u.resourceRepo.IncrementViewCount(id)
	if err != nil {
		return nil, err
	}

	return resource, nil
}

func (u *resourceUsecase) CreateInteraction(userID, resourceID int, rating float64, feedbackText string) (*domain.ResourceInteraction, error) {
	// Check if resource exists
	resource, err := u.resourceRepo.GetByID(resourceID)
	if err != nil {
		return nil, err
	}

	if resource == nil {
		return nil, errors.New("resource not found")
	}

	// Validate rating
	if rating < 0 || rating > 5 {
		return nil, errors.New("rating must be between 0 and 5")
	}

	// Check if user already has an interaction with this resource
	existingInteraction, err := u.resourceRepo.GetInteractionByUserAndResource(userID, resourceID)
	if err != nil {
		return nil, err
	}

	// If interaction exists, update it
	if existingInteraction != nil {
		existingInteraction.Rating = rating
		existingInteraction.FeedbackText = feedbackText

		err = u.resourceRepo.UpdateInteraction(existingInteraction)
		if err != nil {
			return nil, err
		}

		return existingInteraction, nil
	}

	// Create new interaction
	interaction := &domain.ResourceInteraction{
		ResourceID:   resourceID,
		UserID:       userID,
		Rating:       rating,
		FeedbackText: feedbackText,
	}

	return u.resourceRepo.CreateInteraction(interaction)
}

func (u *resourceUsecase) GetInteractions(resourceID int, limit, offset int) ([]*domain.ResourceInteraction, int, error) {
	// Check if resource exists
	resource, err := u.resourceRepo.GetByID(resourceID)
	if err != nil {
		return nil, 0, err
	}

	if resource == nil {
		return nil, 0, errors.New("resource not found")
	}

	return u.resourceRepo.GetInteractionsByResourceID(resourceID, limit, offset)
}
