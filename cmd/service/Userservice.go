package service

import (
    "errors"
    "strings"
    "time"

    "github.com/brehan/bank/cmd/data"
)

// UserService defines the interface for user-related operations
type UserService interface {
    ValidateUser(user data.User) error
}

// DefaultUserService is the concrete implementation of UserService
type DefaultUserService struct{}

// ValidateUser validates the fields of a data.User struct
func (userSer *DefaultUserService) ValidateUser(user data.User) error {
    // Validate Id
    if user.Id == "" { // Check if Id is an empty string
        return errors.New("id is required")
    }

    // Validate Name
    if strings.TrimSpace(user.Name) == "" { // Use strings.TrimSpace to handle whitespace
        return errors.New("name is required")
    }
    // Optional: Add length validation for Name
    if len(user.Name) < 3 {
        return errors.New("name must be at least 3 characters long")
    }

    // Validate Password
    if strings.TrimSpace(user.Password) == "" {
        return errors.New("password is required")
    }
    // Optional: Add password strength validation
    if len(user.Password) < 8 {
        return errors.New("password must be at least 8 characters long")
    }

    // Validate createdAt
    if user.createdAt.IsZero() { // Check if createdAt is the zero value for time.Time
        return errors.New("createdAt timestamp is required")
    }
    // Optional: Ensure createdAt is not in the future
    if user.createdAt.After(time.Now()) {
        return errors.New("createdAt timestamp cannot be in the future")
    }

    // Validate updatedAt
    if user.updatedAt.IsZero() {
        return errors.New("updatedAt timestamp is required")
    }
    // Optional: Ensure updatedAt is not before createdAt
    if user.updatedAt.Before(user.createdAt) {
        return errors.New("updatedAt timestamp cannot be before createdAt")
    }

    // All validations passed
    return nil
}