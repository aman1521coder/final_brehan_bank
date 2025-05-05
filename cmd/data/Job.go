package data 
import (
    "time"
)
type Job struct {
    Id        string    `json:"id"`
    JobName   string    `json:"job_name"`
    JobDesc   string    `json:"job_desc"`
    JobType   string    `json:"job_type"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
	JobProgress string `json:"job_progress"`
	Rmeark string `json:"rmeark"`
	Closetime time.Time	`json:"closetime"`
}
