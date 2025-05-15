package data

import (
	"time"
	"database/sql"
)

type Job struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Qualifications string  `json:"qualifications"`
	Department  string     `json:"department"`
	Location    string     `json:"location"`
	JobType     string     `json:"job_type"` // internal, external, or both
	Salary      string     `json:"salary"`
	CreatedAt   time.Time  `json:"created_at"`
	Deadline    *time.Time `json:"deadline"`
	Status      sql.NullString `json:"status"` // open, closed, filled
}

// Extended InternalEmployee for response matching
type MatchedInternalEmployee struct {
	InternalEmployee
	MatchedEmployee string `json:"matched_employee,omitempty"`
	PromotionStatus string `json:"promotion_status,omitempty"`
}

