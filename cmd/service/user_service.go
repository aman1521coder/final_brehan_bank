package service

import (
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserExists        = errors.New("user already exists")
)

type User struct {
	ID        uuid.UUID
	Name      string
	Password  string
	Role      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

func (s *UserService) Register(name, password, role string) (*User, error) {
	// Check if user exists
	var exists bool
	err := s.db.QueryRow("SELECT EXISTS(SELECT 1 FROM Users WHERE name = $1)", name).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrUserExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &User{
		ID:        uuid.New(),
		Name:      name,
		Password:  string(hashedPassword),
		Role:      role,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Insert into Users table
	_, err = s.db.Exec(`
		INSERT INTO Users (id, name, password, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
	`, user.ID, user.Name, user.Password, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Insert into role-specific table
	switch role {
	case "admin":
		_, err = s.db.Exec("INSERT INTO Admin (user_id) VALUES ($1)", user.ID)
	case "manager":
		_, err = s.db.Exec("INSERT INTO Manager (user_id) VALUES ($1)", user.ID)
	default:
		return nil, errors.New("invalid role")
	}

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) Login(name, password string) (*User, error) {
	var user User
	err := s.db.QueryRow(`
		SELECT u.id, u.name, u.password, 
		CASE 
			WHEN a.user_id IS NOT NULL THEN 'admin'
			WHEN m.user_id IS NOT NULL THEN 'manager'
			ELSE 'user'
		END as role,
		u.created_at, u.updated_at
		FROM Users u
		LEFT JOIN Admin a ON u.id = a.user_id
		LEFT JOIN Manager m ON u.id = m.user_id
		WHERE u.name = $1
	`, name).Scan(&user.ID, &user.Name, &user.Password, &user.Role, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	return &user, nil
}

func (s *UserService) GetUserByID(id uuid.UUID) (*User, error) {
	var user User
	err := s.db.QueryRow(`
		SELECT u.id, u.name, u.password, 
		CASE 
			WHEN a.user_id IS NOT NULL THEN 'admin'
			WHEN m.user_id IS NOT NULL THEN 'manager'
			ELSE 'user'
		END as role,
		u.created_at, u.updated_at
		FROM Users u
		LEFT JOIN Admin a ON u.id = a.user_id
		LEFT JOIN Manager m ON u.id = m.user_id
		WHERE u.id = $1
	`, id).Scan(&user.ID, &user.Name, &user.Password, &user.Role, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	return &user, nil
} 