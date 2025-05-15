package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/brehan/bank/cmd/data"
	"github.com/brehan/bank/cmd/repository"
)

type ApplicationLinkService struct {
	repo *repository.Repository
}

func NewApplicationLinkService(repo *repository.Repository) *ApplicationLinkService {
	return &ApplicationLinkService{repo: repo}
}

// GenerateApplicationLinks creates both internal and external application links for a job
func (s *ApplicationLinkService) GenerateApplicationLinks(jobID string) (internalLink, externalLink data.ApplicationLink, err error) {
	// First, get the job to make sure it exists
	_, err = s.repo.GetJobById(jobID)
	if err != nil {
		return data.ApplicationLink{}, data.ApplicationLink{}, errors.New("job not found")
	}

	// Create internal application link
	internalLink, err = s.repo.CreateApplicationLink(jobID, "internal")
	if err != nil {
		return data.ApplicationLink{}, data.ApplicationLink{}, errors.New("failed to create internal application link")
	}

	// Create external application link
	externalLink, err = s.repo.CreateApplicationLink(jobID, "external")
	if err != nil {
		return internalLink, data.ApplicationLink{}, errors.New("failed to create external application link")
	}

	return internalLink, externalLink, nil
}

// GetApplicationLinksByJob returns all application links for a job
func (s *ApplicationLinkService) GetApplicationLinksByJob(jobID string) ([]data.ApplicationLink, error) {
	return s.repo.GetApplicationLinksByJobID(jobID)
}

// ValidateApplicationLink checks if a link is valid (exists, not expired, not used)
func (s *ApplicationLinkService) ValidateApplicationLink(token string) (data.ApplicationLink, error) {
	link, err := s.repo.GetApplicationLinkByToken(token)
	if err != nil {
		return data.ApplicationLink{}, errors.New("invalid application link")
	}

	// Check if the link is expired
	if time.Now().After(link.ExpiresAt) {
		return data.ApplicationLink{}, errors.New("application link has expired")
	}

	// Check if the link has been used
	if link.IsUsed {
		return data.ApplicationLink{}, errors.New("application link has already been used")
	}

	return link, nil
}

// FormatApplicationLinksForResponse formats application links for response to client
func (s *ApplicationLinkService) FormatApplicationLinksForResponse(
	internalLink, externalLink data.ApplicationLink, baseURL string) ([]data.ApplicationLinkResponse, error) {
	
	// Get the job to include its title
	job, err := s.repo.GetJobById(internalLink.JobID)
	if err != nil {
		return nil, errors.New("job not found")
	}

	responses := []data.ApplicationLinkResponse{
		{
			JobID:     internalLink.JobID,
			JobTitle:  job.Title,
			URL:       fmt.Sprintf("%s/apply/internal/%s", baseURL, internalLink.Token),
			Type:      "internal",
			ExpiresAt: internalLink.ExpiresAt.Format(time.RFC3339),
		},
		{
			JobID:     externalLink.JobID,
			JobTitle:  job.Title,
			URL:       fmt.Sprintf("%s/apply/external/%s", baseURL, externalLink.Token),
			Type:      "external",
			ExpiresAt: externalLink.ExpiresAt.Format(time.RFC3339),
		},
	}

	return responses, nil
}

// MarkLinkAsUsed marks an application link as used
func (s *ApplicationLinkService) MarkLinkAsUsed(token string) error {
	return s.repo.MarkApplicationLinkAsUsed(token)
} 