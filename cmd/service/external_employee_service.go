package service

import (
	"errors"
	"fmt"
	"io"

	"os"
	"path/filepath"

	"github.com/brehan/bank/cmd/data"
	"github.com/brehan/bank/cmd/repository"
)

type ExternalEmployeeService struct {
	repo repository.Repository
}

func NewExternalEmployeeService(repo repository.Repository) *ExternalEmployeeService {
	return &ExternalEmployeeService{
		repo: repo,
	}
}

func (s *ExternalEmployeeService) SaveExternalEmployee(emp data.ExternalEmployee) error {
	// First save the resume file if a path is provided
	if emp.Resumepath != "" {
		originalPath := emp.Resumepath
		
		// Save the resume and get the new path
		err := s.SaveResume(emp, originalPath)
		if err != nil {
			return fmt.Errorf("failed to save resume: %w", err)
		}
		
		// Create a safe filename
		safeFileName, err := GetSafeFileName(emp.FirstName, emp.LastName, originalPath)
		if err != nil {
			return fmt.Errorf("failed to create filename: %w", err)
		}
		
		// Update the path in the employee record
		emp.Resumepath = filepath.Join("static", safeFileName)
	}
	
	// Save the employee record to the repository
	err := s.repo.ApplyExternal(emp)
	if err != nil {
		return fmt.Errorf("failed to save employee record: %w", err)
	}
	
	return nil
}

func (s *ExternalEmployeeService) GetAllExternalApplications() ([]data.ExternalEmployee, error) {
	return s.repo.GetAllExternalApplications()
}

func (s *ExternalEmployeeService) GetApplicationsByJobID(jobID string) ([]data.ExternalEmployee, error) {
	allApps, err := s.GetAllExternalApplications()
	if err != nil {
		return nil, err
	}
	
	var jobApps []data.ExternalEmployee
	for _, app := range allApps {
		if app.Jobid == jobID {
			jobApps = append(jobApps, app)
		}
	}
	
	return jobApps, nil
}

func (s *ExternalEmployeeService) SaveResume(emp data.ExternalEmployee, originalFilePath string) error {
	if originalFilePath == "" {
		return errors.New("file path is empty")
	}

	// Use ValidateFilePath from helper.go to check file
	if err := ValidateFilePath(originalFilePath); err != nil {
		return err
	}
	
	// Create a safe filename
	safeFileName, err := GetSafeFileName(emp.FirstName, emp.LastName, originalFilePath)
	if err != nil {
		return fmt.Errorf("failed to create filename: %w", err)
	}
	
	// Define the destination path (static folder)
	destPath := filepath.Join("static", safeFileName)
	
	// Open file to copy
	file, err := os.Open(originalFilePath)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()
	
	// Create destination file
	destFile, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("failed to create destination file: %w", err)
	}
	defer destFile.Close()
	
	// Copy file contents
	_, err = io.Copy(destFile, file)
	if err != nil {
		return fmt.Errorf("failed to copy file: %w", err)
	}
	
	return nil
} 