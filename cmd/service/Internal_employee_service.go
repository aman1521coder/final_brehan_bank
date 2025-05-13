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

type InternalEmployeeService struct {
	repo repository.Repository

}
func NewInternalEmployeeService(repo repository.Repository) *InternalEmployeeService {
	return &InternalEmployeeService{
		repo: repo,
	}
}
/* func (s *InternalEmployeeService) GetEmployeeById(id int) (data.InternalEmployee, error) {
	
	
}
 */
 func (s *InternalEmployeeService) Save_Internal_Employee(emo data.InternalEmployee) error {
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
	err := s.repo.ApplyInternal(emo)
	if err != nil {
		return fmt.Errorf("failed to save employee record: %w", err)
	}
	
	return nil
}


func (s *InternalEmployeeService) SaveResume(emp data.InternalEmployee, originalFilePath string) error {
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
	
	// Check content type
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

func (s *InternalEmployeeService) GetAllInternalApplications() ([]data.InternalEmployee, error) {
	return s.repo.GetAllInternalApplications()
}

func (s *InternalEmployeeService) GetApplicationsByJobID(jobID string) ([]data.InternalEmployee, error) {
	allApps, err := s.GetAllInternalApplications()
	if err != nil {
		return nil, err
	}
	
	var jobApps []data.InternalEmployee
	for _, app := range allApps {
		if app.Jobid == jobID {
			jobApps = append(jobApps, app)
		}
	}
	
	return jobApps, nil
}

// MatchWithExistingEmployee checks if an internal application matches an existing employee
// This can be used for automatic promotion consideration
func (s *InternalEmployeeService) MatchWithExistingEmployee(internalApp data.InternalEmployee) (data.Employee, error) {
	// Try to find a matching employee by name
	// In a real system, you'd use a more reliable identifier
	employees, err := s.repo.GetAllEmployees()
	if err != nil {
		return data.Employee{}, err
	}
	
	fullName := internalApp.FirstName + " " + internalApp.LastName
	
	for _, emp := range employees {
		if emp.FullName == fullName {
			// Found a match
			return emp, nil
		}
	}
	
	return data.Employee{}, errors.New("no matching employee found")
}

// InitiatePromotion marks an employee for promotion consideration
func (s *InternalEmployeeService) InitiatePromotion(employee data.Employee, jobID string) error {
	// In a real implementation, this would:
	// 1. Update the employee's status to indicate they're being considered for promotion
	// 2. Create a promotion record or workflow
	// 3. Notify relevant managers
	
	// For now, we'll just return a placeholder
	return nil
}

