package service

import (
	"errors"
	"time"

	"github.com/brehan/bank/cmd/data"
	"github.com/brehan/bank/cmd/repository"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserExists        = errors.New("user already exists")
	ErrInvalidRole       = errors.New("invalid role")
)

type AuthService struct {
	repo *repository.AuthRepository
}

func NewAuthService(repo *repository.AuthRepository) *AuthService {
	return &AuthService{repo: repo}
}

func (s *AuthService) Register(name, password, role string) (*data.User, string, error) {
	// Validate role
	if role != "admin" && role != "manager" {
		return nil, "", ErrInvalidRole
	}

	// Check if user exists
	existingUser, _, err := s.repo.GetUserByName(name)
	if err != nil {
		return nil, "", err
	}
	if existingUser != nil {
		return nil, "", ErrUserExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	// Create user
	user := &data.User{
		Id:        uuid.New(),
		Name:      name,
		Password:  string(hashedPassword),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Save user
	if err := s.repo.CreateUser(user, role); err != nil {
		return nil, "", err
	}

	return user, role, nil
}

func (s *AuthService) Login(name, password string) (*data.User, string, error) {
	// Get user by name
	user, role, err := s.repo.GetUserByName(name)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		return nil, "", ErrInvalidCredentials
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, "", ErrInvalidCredentials
	}

	return user, role, nil
}

func (s *AuthService) GetUserByID(id uuid.UUID) (*data.User, string, error) {
	user, role, err := s.repo.GetUserByID(id)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		return nil, "", errors.New("user not found")
	}
	return user, role, nil
} 