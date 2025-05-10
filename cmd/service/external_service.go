package service

import(
	"github.com/brehan/bank/cmd/repository"
	"github.com/brehan/bank/cmd/data"
	"fmt"
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
	"net/http"
)
type ExternalService struct {
	repo repository.Repository
}
func NewExternalService(repo repository.Repository) *ExternalService {
	return &ExternalService{
		repo: repo,
	}
}
/* func (s *ExternalService) GetEmployeeById(id int) (data.ExternalEmployee, error) {
	
	
}
 */
 func (s *ExternalService) Save_External_Employee(emo data.ExternalEmployee) error {
	// First save the resume file if a path is provided
	if emo.Resumepath != "" {
		originalPath := emo.Resumepath
		
		// Save the resume and get the new path
		err := s.SaveResume(emo, originalPath)
		if err != nil {
			return fmt.Errorf("failed to save resume: %w", err)
		}
		
		// Create a safe filename
		safeFileName, err := GetSafeFileName(emo.FirstName, emo.LastName, originalPath)
		if err != nil {
			return fmt.Errorf("failed to create filename: %w", err)
		}
		
		// Update the path in the employee record
		emo.Resumepath = filepath.Join("static", safeFileName)
	}
	
	// Save the employee record to the repository
	err := s.repo.ApplyExternal(emo)
	if err != nil {
		return fmt.Errorf("failed to save employee record: %w", err)
	}
	
	return nil
}


func (s *ExternalService) SaveResume(emp data.ExternalEmployee, originalFilePath string) error {
	if originalFilePath == "" {
		return errors.New("file path is empty")
	}

	// Check if file exists
	fileInfo, err := os.Stat(originalFilePath)
	if err != nil {
		return fmt.Errorf("file not found or inaccessible: %w", err)
	}
	
	// Check file size (2MB limit)
	if fileInfo.Size() > MaxFileSize {
		return fmt.Errorf("file exceeds maximum size of 2MB, current size: %d bytes", fileInfo.Size())
	}
	
	// Check file extension
	ext := strings.ToLower(filepath.Ext(originalFilePath))
	if ext != ".pdf" {
		return errors.New("only PDF files are allowed")
	}
	
	// Open file to verify content type
	file, err := os.Open(originalFilePath)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()
	
	// Read the first 512 bytes to detect content type
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil && err != io.EOF {
		return fmt.Errorf("failed to read file: %w", err)
	}
	
	// Reset file pointer to beginning
	_, err = file.Seek(0, 0)
	if err != nil {
		return fmt.Errorf("failed to reset file pointer: %w", err)
	}
	
	
	contentType := http.DetectContentType(buffer)
	if !strings.Contains(contentType, "application/pdf") && !strings.Contains(contentType, "application/octet-stream") {
		return fmt.Errorf("invalid file content type: %s, only PDF files are allowed", contentType)
	}
	
	// Create a safe filename
	safeFileName, err := GetSafeFileName(emp.FirstName, emp.LastName, originalFilePath)
	if err != nil {
		return fmt.Errorf("failed to create filename: %w", err)
	}
	
	// Define the destination path (static folder)
	destPath := filepath.Join("static", safeFileName)
	
	// Save the file
	err = SaveFile(file, destPath)
	if err != nil {
		return fmt.Errorf("failed to save resume: %w", err)
	}
	
	return nil
}