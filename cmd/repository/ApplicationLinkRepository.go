package repository

import (
	"crypto/rand"
	"encoding/base64"
	"github.com/brehan/bank/cmd/data"
	"time"
)

// Generate a secure random token for application URLs
func generateRandomToken(length int) (string, error) {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}

// CreateApplicationLink creates a new application link for a job
func (repo *Repository) CreateApplicationLink(jobID, linkType string) (data.ApplicationLink, error) {
	// Generate a random token
	token, err := generateRandomToken(24) // 24 bytes = 32 chars after base64
	if err != nil {
		return data.ApplicationLink{}, err
	}

	// Set expiration time (7 days from now)
	expiresAt := time.Now().AddDate(0, 0, 7)

	// Create the application link
	link := data.ApplicationLink{
		JobID:     jobID,
		Token:     token,
		Type:      linkType,
		ExpiresAt: expiresAt,
		IsUsed:    false,
		CreatedAt: time.Now(),
	}

	// Insert the link into the database
	query := `INSERT INTO application_links (job_id, token, type, expires_at, is_used, created_at)
			  VALUES ($1, $2, $3, $4, $5, $6)
			  RETURNING id`

	err = repo.DB.QueryRow(query,
		link.JobID,
		link.Token,
		link.Type,
		link.ExpiresAt,
		link.IsUsed,
		link.CreatedAt).Scan(&link.ID)

	return link, err
}

// GetApplicationLinkByToken retrieves an application link by its token
func (repo *Repository) GetApplicationLinkByToken(token string) (data.ApplicationLink, error) {
	query := `SELECT id, job_id, token, type, expires_at, is_used, created_at
			  FROM application_links
			  WHERE token = $1`

	var link data.ApplicationLink
	err := repo.DB.QueryRow(query, token).Scan(
		&link.ID,
		&link.JobID,
		&link.Token,
		&link.Type,
		&link.ExpiresAt,
		&link.IsUsed,
		&link.CreatedAt)

	return link, err
}

// GetApplicationLinksByJobID retrieves all application links for a job
func (repo *Repository) GetApplicationLinksByJobID(jobID string) ([]data.ApplicationLink, error) {
	query := `SELECT id, job_id, token, type, expires_at, is_used, created_at
			  FROM application_links
			  WHERE job_id = $1`

	rows, err := repo.DB.Query(query, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []data.ApplicationLink
	for rows.Next() {
		var link data.ApplicationLink
		err := rows.Scan(
			&link.ID,
			&link.JobID,
			&link.Token,
			&link.Type,
			&link.ExpiresAt,
			&link.IsUsed,
			&link.CreatedAt)
		if err != nil {
			return nil, err
		}
		links = append(links, link)
	}

	return links, nil
}

// MarkApplicationLinkAsUsed marks an application link as used
func (repo *Repository) MarkApplicationLinkAsUsed(token string) error {
	query := `UPDATE application_links
			  SET is_used = true
			  WHERE token = $1`

	_, err := repo.DB.Exec(query, token)
	return err
}

// CreateApplicationLinksTable creates the application_links table if it doesn't exist
func (repo *Repository) CreateApplicationLinksTable() error {
	query := `
		CREATE TABLE IF NOT EXISTS application_links (
			id SERIAL PRIMARY KEY,
			job_id VARCHAR(36) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
			token VARCHAR(255) NOT NULL UNIQUE,
			type VARCHAR(20) NOT NULL, -- 'internal' or 'external'
			expires_at TIMESTAMP NOT NULL,
			is_used BOOLEAN NOT NULL DEFAULT false,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`

	_, err := repo.DB.Exec(query)
	return err
} 