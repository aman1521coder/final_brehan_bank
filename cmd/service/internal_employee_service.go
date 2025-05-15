package service

import (
	"errors"
	"fmt"
	"path/filepath"
	"os"
	"io"
	"github.com/brehan/bank/cmd/data"
	"github.com/brehan/bank/cmd/repository"
)


// InternalEmployeeService handles operations for internal employees
type InternalEmployeeService struct {
	repo repository.Repository
}

// NewInternalEmployeeService creates a new InternalEmployeeService instance
func NewInternalEmployeeService(repo repository.Repository) *InternalEmployeeService {
	return &InternalEmployeeService{
		repo: repo,
	}
}

// MatchWithExistingEmployee matches an internal application with an existing employee
func (s *InternalEmployeeService) MatchWithExistingEmployee(application data.InternalEmployee) (data.Employee, error) {
	// Use the repository's enhanced auto-matching function
	matchedEmployee, err := s.repo.AutoMatchInternalApplication(application)
	if err != nil {
		return data.Employee{}, err
	}
	
	// If we have a match, calculate the experience score automatically
	// Other scores will need to be filled by managers and district managers
	err = s.repo.CalculateExperienceScore(matchedEmployee.ID)
	if err != nil {
		return matchedEmployee, err
	}
	
	// Return the matched employee with initialized evaluation
	return matchedEmployee, nil
}

// GetApplicationsByJobID retrieves all internal applications for a specific job
func (s *InternalEmployeeService) GetApplicationsByJobID(jobID string) ([]data.InternalEmployee, error) {
	return s.repo.GetInternalApplicationsByJobID(jobID)
}

// GetAllInternalApplications retrieves all internal applications
func (s *InternalEmployeeService) GetAllInternalApplications() ([]data.InternalEmployee, error) {
	return s.repo.GetAllInternalApplications()
}

// Save_Internal_Employee saves an internal employee application
func (s *InternalEmployeeService) Save_Internal_Employee(emp data.InternalEmployee) error {
	// First save the resume file if a path is provided
	if emp.Resumepath != "" {
		originalPath := emp.Resumepath
		
		// Save the resume and get the new path
		err := s.SaveResume(emp, originalPath)
		if err != nil {
			return fmt.Errorf("failed to save resume: %w", err)
		}
		
		// Create a safe filename using helper function
		safeFileName, err := GetSafeFileName(emp.FirstName, emp.LastName, originalPath)
		if err != nil {
			return fmt.Errorf("failed to create filename: %w", err)
		}
		
		// Update the path in the employee record
		emp.Resumepath = filepath.Join("static", safeFileName)
	}
	
	// Save the employee record to the repository
	err := s.repo.ApplyInternal(emp)
	if err != nil {
		return fmt.Errorf("failed to save employee record: %w", err)
	}
	
	return nil
}

// SaveResume saves a resume file
func (s *InternalEmployeeService) SaveResume(emp data.InternalEmployee, originalFilePath string) error {
	if originalFilePath == "" {
		return errors.New("file path is empty")
	}

	// Use helper function to validate file path
	err := ValidateFilePath(originalFilePath)
	if err != nil {
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