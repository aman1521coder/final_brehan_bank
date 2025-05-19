package repository

import (
	"database/sql"
	"time"

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

// DeleteUser removes a user and their role information
func (repo *AuthRepository) DeleteUser(userID uuid.UUID) error {
	// Start a transaction
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	// Determine the role first
	role, _, err := repo.getRoleAndDistrict(userID)
	if err != nil {
		return err
	}

	// Delete from role-specific table first to maintain foreign key constraints
	switch role {
	case "admin":
		_, err = tx.Exec("DELETE FROM admin WHERE user_id = $1", userID)
	case "manager":
		_, err = tx.Exec("DELETE FROM manager WHERE user_id = $1", userID)
	case "district_manager":
		_, err = tx.Exec("DELETE FROM district_manager WHERE user_id = $1", userID)
	default:
		return sql.ErrNoRows // No role found
	}
	if err != nil {
		return err
	}

	// Finally, delete from users table
	_, err = tx.Exec("DELETE FROM users WHERE id = $1", userID)
	return err
}

// GetAllUsers retrieves all users with their roles and districts
func (repo *AuthRepository) GetAllUsers() ([]map[string]interface{}, error) {
	// Use the correct table name "districtmanager" (all lowercase)
	// and ensure the alias 'dm' is consistently used for it.
	query := `
        SELECT u.id, u.name, u.created_at, u.updated_at,
               CASE
                   WHEN a.user_id IS NOT NULL THEN 'admin'
                   WHEN m.user_id IS NOT NULL THEN 'manager'
                   WHEN dm.user_id IS NOT NULL THEN 'DistrictManager' -- This is the role name, can be different from table name
                   ELSE 'unknown'
               END as role,
               dm.district
        FROM users u
        LEFT JOIN admin a ON u.id = a.user_id
        LEFT JOIN manager m ON u.id = m.user_id
        LEFT JOIN districtmanager dm ON u.id = dm.user_id -- <<<< CORRECTED TABLE NAME HERE
        ORDER BY u.created_at DESC
    `

	rows, err := repo.DB.Query(query)
	if err != nil {
		// It's good practice to log the error for more details during debugging
		// log.Printf("Error executing GetAllUsers query: %v", err)
		return nil, err
	}
	defer rows.Close()

	users := []map[string]interface{}{} // Initialize with empty slice

	for rows.Next() {
		var (
			id        uuid.UUID
			name      string
			createdAt time.Time
			updatedAt time.Time
			role      string
			district  sql.NullString // For dm.district which can be NULL
		)

		if err := rows.Scan(&id, &name, &createdAt, &updatedAt, &role, &district); err != nil {
			// log.Printf("Error scanning user row: %v", err)
			return nil, err
		}

		user := map[string]interface{}{
			"id":         id.String(),
			"name":       name,
			"created_at": createdAt,
			"updated_at": updatedAt,
			"role":       role,
			"district":   nil, // Default to nil
		}
		if district.Valid {
			user["district"] = district.String // Set district if it's not NULL
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		// log.Printf("Error after iterating user rows: %v", err)
		return nil, err
	}

	return users, nil
}
