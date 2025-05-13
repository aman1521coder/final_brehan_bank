package data

import (
	"time"
)

type Job struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Requirements string   `json:"requirements"`
	Department  string    `json:"department"`
	Location    string    `json:"location"`
	JobType     string    `json:"job_type"` // internal, external, or both
	Salary      string    `json:"salary"`
	PostedDate  time.Time `json:"posted_date"`
	Deadline    time.Time `json:"deadline"`
	Status      string    `json:"status"` // open, closed, filled
}

// Extended InternalEmployee for response matching
type MatchedInternalEmployee struct {
	InternalEmployee
	MatchedEmployee string `json:"matched_employee,omitempty"`
	PromotionStatus string `json:"promotion_status,omitempty"`
}

