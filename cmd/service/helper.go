package service

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

const (

	MaxFileSize = 2 * 1024 * 1024 
)

func ValidateFile(file *multipart.FileHeader) error {
	// Check file size
	if file.Size > MaxFileSize {
		return fmt.Errorf("file size exceeds the limit of 2MB, current size: %d bytes", file.Size)
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".pdf" {
		return errors.New("only PDF files are allowed")
	}

	// Optional: verify content type (MIME type)
	f, err := file.Open()
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer f.Close()

	// Read the first 512 bytes to detect content type
	buffer := make([]byte, 512)
	_, err = f.Read(buffer)
	if err != nil && err != io.EOF {
		return fmt.Errorf("failed to read file: %w", err)
	}

	contentType := http.DetectContentType(buffer)
	if !strings.Contains(contentType, "application/pdf") && !strings.Contains(contentType, "application/octet-stream") {
		return fmt.Errorf("invalid file content type: %s, only PDF files are allowed", contentType)
	}

	return nil
}

// SaveFile saves an uploaded file to the specified destination
func SaveFile(src multipart.File, dstPath string) error {
	// Create destination directory if it doesn't exist
	err := os.MkdirAll(filepath.Dir(dstPath), 0755)
	if err != nil {
		return fmt.Errorf("failed to create destination directory: %w", err)
	}

	// Create the destination file
	dst, err := os.Create(dstPath)
	if err != nil {
		return fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	// Copy the file contents
	_, err = io.Copy(dst, src)
	if err != nil {
		return fmt.Errorf("failed to save file: %w", err)
	}

	return nil
}

// GetSafeFileName creates a safe filename from the given name
func GetSafeFileName(firstName, lastName, originalFilename string) (string, error) {
	// Get file extension from original filename
	ext := strings.ToLower(filepath.Ext(originalFilename))
	if ext != ".pdf" {
		ext = ".pdf" // Ensure PDF extension
	}

	// Create a filename using first and last name
	baseName := fmt.Sprintf("%s_%s", firstName, lastName)
	
	// Remove invalid characters from filename
	reg := `[^a-zA-Z0-9_-]`
	safeName := regexp.MustCompile(reg).ReplaceAllString(baseName, "")
	
	if safeName == "" {
		return "", errors.New("filename is empty or contains only invalid characters")
	}
	
	// Limit filename length
	if len(safeName) > 200 { // Allow space for extension and some extra characters
		safeName = safeName[:200]
	}
	
	// Append extension
	fileName := safeName + ext
	
	return fileName, nil
}

// ProcessResume handles the resume upload process
func ProcessResume(file *multipart.FileHeader, firstName, lastName string) (string, error) {
	// Validate the file
	if err := ValidateFile(file); err != nil {
		return "", err
	}
	
	// Create a safe filename
	fileName, err := GetSafeFileName(firstName, lastName, file.Filename)
	if err != nil {
		return "", fmt.Errorf("failed to create filename: %w", err)
	}
	
	// Define destination path
	destPath := filepath.Join("static", fileName)
	
	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()
	
	// Save the file
	if err := SaveFile(src, destPath); err != nil {
		return "", err
	}
	
	return destPath, nil
}

// ValidateFilePath checks if a file at the given path is a PDF and under the size limit
func ValidateFilePath(filePath string) error {
	// Check if file exists
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return fmt.Errorf("file not found or inaccessible: %w", err)
	}
	
	// Check file size
	if fileInfo.Size() > MaxFileSize {
		return fmt.Errorf("file size exceeds the limit of 2MB, current size: %d bytes", fileInfo.Size())
	}
	
	// Check file extension
	ext := strings.ToLower(filepath.Ext(filePath))
	if ext != ".pdf" {
		return errors.New("only PDF files are allowed")
	}
	
	// Verify content type
	file, err := os.Open(filePath)
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
	
	contentType := http.DetectContentType(buffer)
	if !strings.Contains(contentType, "application/pdf") && !strings.Contains(contentType, "application/octet-stream") {
		return fmt.Errorf("invalid file content type: %s, only PDF files are allowed", contentType)
	}
	
	return nil
} 