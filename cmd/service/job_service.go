package service

import (
	"errors"
	"time"

	"github.com/brehan/bank/cmd/data"
	"github.com/brehan/bank/cmd/repository"
	"database/sql"
)
type JobService struct {
	repo *repository.Repository
}

func NewJobService(repo *repository.Repository) *JobService {
	return &JobService{repo: repo}
}

// ValidateJob validates job data
func (s *JobService) ValidateJob(job data.Job) error {
	if job.Title == "" {
		return errors.New("job title is required")
	}
	if job.Description == "" {
		return errors.New("job description is required")
	}
	if job.Department == "" {
		return errors.New("department is required")
	}
	return nil
}

// CreateJob creates a new job posting
func (s *JobService) CreateJob(job data.Job) error {
	if err := s.ValidateJob(job); err != nil {
		return err
	}
	
	// Set default values
	if job.CreatedAt.IsZero() {
		job.CreatedAt = time.Now()
	}

	// Set default status if not valid
	if !job.Status.Valid {
		job.Status = sql.NullString{String: "open", Valid: true}
	}
	
	return s.repo.CreateJob(job)
}

// GetAllJobs returns all job postings
func (s *JobService) GetAllJobs() ([]data.Job, error) {
	return s.repo.GetAllJobs()
}

// GetJobById returns a specific job by ID
func (s *JobService) GetJobById(id string) (data.Job, error) {
	return s.repo.GetJobById(id)
}

// UpdateJob updates an existing job
func (s *JobService) UpdateJob(job data.Job) error {
	if err := s.ValidateJob(job); err != nil {
		return err
	}
	
	// Check if the job exists
	existingJob, err := s.GetJobById(job.ID)
	if err != nil {
		return errors.New("job not found")
	}
	
	// Preserve fields that shouldn't be updated
	job.CreatedAt = existingJob.CreatedAt
	
	return s.repo.UpdateJob(job)
}

// DeleteJob deletes a job posting
func (s *JobService) DeleteJob(id string) error {
	// Check if the job exists
	_, err := s.GetJobById(id)
	if err != nil {
		return errors.New("job not found")
	}
	
	return s.repo.DeleteJob(id)
}

// Get all applicants for a job
func (s *JobService) GetJobApplicants(jobID string) ([]data.InternalEmployee, []data.ExternalEmployee, error) {
	internalApps, err1 := s.repo.GetInternalApplicationsByJobID(jobID)
	externalApps, err2 := s.repo.GetExternalApplicationsByJobID(jobID)
	
	if err1 != nil {
		return nil, nil, err1
	}
	if err2 != nil {
		return nil, nil, err2
	}
	
	return internalApps, externalApps, nil
} 