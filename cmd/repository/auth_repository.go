package repository

import (
	"database/sql"

	"github.com/brehan/bank/cmd/data"
	"github.com/google/uuid"
)

type AuthRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r *AuthRepository) CreateUser(user *data.User, role string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert into Users table
	_, err = tx.Exec(`
		INSERT INTO Users (id, name, password, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
	`, user.Id, user.Name, user.Password, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return err
	}

	// Insert into role-specific table
	switch role {
	case "admin":
		_, err = tx.Exec("INSERT INTO Admin (user_id) VALUES ($1)", user.Id)
	case "manager":
		_, err = tx.Exec("INSERT INTO Manager (user_id) VALUES ($1)", user.Id)
	}
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *AuthRepository) GetUserByName(name string) (*data.User, string, error) {
	var user data.User
	var role string
	err := r.db.QueryRow(`
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
	`, name).Scan(&user.Id, &user.Name, &user.Password, &role, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, "", nil
	}
	if err != nil {
		return nil, "", err
	}

	return &user, role, nil
}

func (r *AuthRepository) GetUserByID(id uuid.UUID) (*data.User, string, error) {
	var user data.User
	var role string
	err := r.db.QueryRow(`
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
	`, id).Scan(&user.Id, &user.Name, &user.Password, &role, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, "", nil
	}
	if err != nil {
		return nil, "", err
	}

	return &user, role, nil
} 