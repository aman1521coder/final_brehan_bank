package data

import (
	"time"
)

// ApplicationLink represents a unique, randomly generated link for an application
type ApplicationLink struct {
	ID          string     `json:"id"`
	JobID       string     `json:"job_id"`
	Token       string     `json:"token"`       // Random token for URL
	Type        string     `json:"type"`        // "internal" or "external"
	ExpiresAt   time.Time  `json:"expires_at"`  // When the link expires
	IsUsed      bool       `json:"is_used"`     // Whether the link has been used
	CreatedAt   time.Time  `json:"created_at"`
}

// ApplicationLinkResponse is used for sending the link to the frontend
type ApplicationLinkResponse struct {
	JobID      string `json:"job_id"`
	JobTitle   string `json:"job_title"`
	URL        string `json:"url"`        // Full URL with token
	Type       string `json:"type"`       // "internal" or "external"
	ExpiresAt  string `json:"expires_at"` // Formatted expiration time
} 