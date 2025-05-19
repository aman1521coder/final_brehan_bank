package service

import (
    "errors"
    "strings"
    "time"

    "github.com/brehan/bank/cmd/data"
    "github.com/brehan/bank/cmd/repository"
    "github.com/google/uuid"
    "golang.org/x/crypto/bcrypt"
)

var (
    ErrInvalidCredentials = errors.New("invalid credentials")
    ErrUserExists         = errors.New("user already exists")
    ErrInvalidRole        = errors.New("invalid role")
    ErrInvalidDistrict    = errors.New("district required for district_manager")
)

type AuthService struct {
    repo        *repository.AuthRepository
    userService *DefaultUserService
}

func NewAuthService(repo *repository.AuthRepository) *AuthService {
    return &AuthService{
        repo:        repo,
        userService: &DefaultUserService{},
    }
}

func (s *AuthService) Register(name, password, role, district string) (*data.User, string, string, error) {
    if role != "admin" && role != "manager" && role != "district_manager" {
        return nil, "", "", ErrInvalidRole
    }

    if role == "district_manager" && district == "" {
        return nil, "", "", ErrInvalidDistrict
    }
    if role != "district_manager" {
        district = ""
    }

    existingUser, _, _, err := s.repo.GetUserByName(name)
    if err != nil {
        return nil, "", "", err
    }
    if existingUser != nil {
        return nil, "", "", ErrUserExists
    }

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return nil, "", "", err
    }

    user := &data.User{
        Id:        uuid.New(),
        Name:      name,
        Password:  string(hashedPassword),
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }

    if err := s.userService.ValidateUser(*user); err != nil {
        return nil, "", "", err
    }

    if err := s.repo.CreateUser(user, role, district); err != nil {
        return nil, "", "", err
    }

    return user, role, district, nil
}

func (s *AuthService) Login(name, password string) (*data.User, string, string, error) {
    user, role, district, err := s.repo.GetUserByName(name)
    if err != nil {
        return nil, "", "", err
    }
    if user == nil {
        return nil, "", "", ErrInvalidCredentials
    }

    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
    if err != nil {
        return nil, "", "", ErrInvalidCredentials
    }

    return user, role, district, nil
}

func (s *AuthService) GetUserByID(id uuid.UUID) (*data.User, string, string, error) {
    user, role, district, err := s.repo.GetUserByID(id)
    if err != nil {
        return nil, "", "", err
    }
    if user == nil {
        return nil, "", "", errors.New("user not found")
    }
    return user, role, district, nil
}

// Getallusers retrieves all users with their roles and districts
func (s *AuthService) Getallusers() ([]map[string]interface{}, error) {
    return s.repo.GetAllUsers()
}

type UserService interface {
    ValidateUser(user data.User) error
}

type DefaultUserService struct{}

func (userSer *DefaultUserService) ValidateUser(user data.User) error {
    if user.Id == uuid.Nil {
        return errors.New("id is required")
    }

    if strings.TrimSpace(user.Name) == "" {
        return errors.New("name is required")
    }
    if len(user.Name) < 3 {
        return errors.New("name must be at least 3 characters long")
    }

    if strings.TrimSpace(user.Password) == "" {
        return errors.New("password is required")
    }
    if len(user.Password) < 8 {
        return errors.New("password must be at least 8 characters long")
    }

    if user.CreatedAt.IsZero() {
        return errors.New("createdAt timestamp is required")
    }
    if user.CreatedAt.After(time.Now()) {
        return errors.New("createdAt timestamp cannot be in the future")
    }

    if user.UpdatedAt.IsZero() {
        return errors.New("updatedAt timestamp is required")
    }
    if user.UpdatedAt.Before(user.CreatedAt) {
        return errors.New("updatedAt timestamp cannot be before createdAt")
    }

    return nil
}