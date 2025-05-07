package repository

import (
	"database/sql"
)

func InitDB(datasource string) (*sql.DB, error) {
	db, err := sql.Open("postgres", datasource)
	if err != nil {
		return nil, err
	}

	// Test the connection
	if err = db.Ping(); err != nil {
		return nil, err
	}

	// Create auth tables if they don't exist
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS Users (
			id UUID PRIMARY KEY,
			name TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL
		);

		CREATE TABLE IF NOT EXISTS Admin (
			user_id UUID PRIMARY KEY REFERENCES Users(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS Manager (
			user_id UUID PRIMARY KEY REFERENCES Users(id) ON DELETE CASCADE
		);
	`)
	if err != nil {
		return nil, err
	}

	return db, nil
} 