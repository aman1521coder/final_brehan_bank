package repository

import (
    "database/sql"

    "github.com/brehan/bank/cmd/data"
    "github.com/google/uuid"
)

type AuthRepository struct {
    DB *sql.DB
}

func NewAuthRepository(db *sql.DB) *AuthRepository {
    return &AuthRepository{DB: db}
}

func (repo *AuthRepository) CreateUser(user *data.User, role, district string) error {
    // Insert into users table
    query := `INSERT INTO users (id, name, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`
    _, err := repo.DB.Exec(query, user.Id, user.Name, user.Password, user.CreatedAt, user.UpdatedAt)
    if err != nil {
        return err
    }

    // Insert into role-specific table
    switch role {
    case "admin":
        query = `INSERT INTO admin (user_id) VALUES ($1)`
        _, err = repo.DB.Exec(query, user.Id)
    case "manager":
        query = `INSERT INTO manager (user_id) VALUES ($1)`
        _, err = repo.DB.Exec(query, user.Id)
    case "district_manager":
        query = `INSERT INTO district_manager (user_id, district) VALUES ($1, $2)`
        _, err = repo.DB.Exec(query, user.Id, district)
    default:
        return sql.ErrNoRows // Invalid role
    }
    return err
}

func (repo *AuthRepository) GetUserByName(name string) (*data.User, string, string, error) {
    // Get user
    var user data.User
    query := `SELECT id, name, password, created_at, updated_at FROM users WHERE name = $1`
    err := repo.DB.QueryRow(query, name).Scan(&user.Id, &user.Name, &user.Password, &user.CreatedAt, &user.UpdatedAt)
    if err == sql.ErrNoRows {
        return nil, "", "", nil // User not found
    }
    if err != nil {
        return nil, "", "", err
    }

    // Determine role and district
    role, district, err := repo.getRoleAndDistrict(user.Id)
    if err != nil {
        return nil, "", "", err
    }

    return &user, role, district, nil
}

func (repo *AuthRepository) GetUserByID(id uuid.UUID) (*data.User, string, string, error) {
    // Get user
    var user data.User
    query := `SELECT id, name, password, created_at, updated_at FROM users WHERE id = $1`
    err := repo.DB.QueryRow(query, id).Scan(&user.Id, &user.Name, &user.Password, &user.CreatedAt, &user.UpdatedAt)
    if err == sql.ErrNoRows {
        return nil, "", "", nil // User not found
    }
    if err != nil {
        return nil, "", "", err
    }

    // Determine role and district
    role, district, err := repo.getRoleAndDistrict(user.Id)
    if err != nil {
        return nil, "", "", err
    }

    return &user, role, district, nil
}

// Helper to determine role and district
func (repo *AuthRepository) getRoleAndDistrict(userID uuid.UUID) (string, string, error) {
    // Check admin
    var id uuid.UUID
    query := `SELECT user_id FROM admin WHERE user_id = $1`
    err := repo.DB.QueryRow(query, userID).Scan(&id)
    if err == nil {
        return "admin", "", nil
    }
    if err != sql.ErrNoRows {
        return "", "", err
    }

    // Check manager
    query = `SELECT user_id FROM manager WHERE user_id = $1`
    err = repo.DB.QueryRow(query, userID).Scan(&id)
    if err == nil {
        return "manager", "", nil
    }
    if err != sql.ErrNoRows {
        return "", "", err
    }

    // Check district_manager
    var district string
    query = `SELECT district FROM district_manager WHERE user_id = $1`
    err = repo.DB.QueryRow(query, userID).Scan(&district)
    if err == nil {
        return "district_manager", district, nil
    }
    if err != sql.ErrNoRows {
        return "", "", err
    }

    return "", "", sql.ErrNoRows // No role found
}