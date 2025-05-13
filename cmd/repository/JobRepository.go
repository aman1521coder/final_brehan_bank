package repository

import (
	"github.com/brehan/bank/cmd/data"
)

// Create a new job
func (repo *Repository) CreateJob(job data.Job) error {
	query := `INSERT INTO jobs (title, description, requirements, department, location, job_type, salary, posted_date, deadline, status)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
			  RETURNING id`
	
	err := repo.DB.QueryRow(query, 
		job.Title, 
		job.Description, 
		job.Requirements,
		job.Department,
		job.Location,
		job.JobType,
		job.Salary,
		job.PostedDate,
		job.Deadline,
		job.Status).Scan(&job.ID)
	
	return err
}

// Get all jobs
func (repo *Repository) GetAllJobs() ([]data.Job, error) {
	query := `SELECT id, title, description, requirements, department, location, job_type, salary, posted_date, deadline, status 
			  FROM jobs 
			  ORDER BY posted_date DESC`
	
	rows, err := repo.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var jobs []data.Job
	for rows.Next() {
		var job data.Job
		err := rows.Scan(
			&job.ID, 
			&job.Title, 
			&job.Description, 
			&job.Requirements,
			&job.Department,
			&job.Location,
			&job.JobType,
			&job.Salary,
			&job.PostedDate,
			&job.Deadline,
			&job.Status)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	
	return jobs, nil
}

// Get job by ID
func (repo *Repository) GetJobById(id int) (data.Job, error) {
	query := `SELECT id, title, description, requirements, department, location, job_type, salary, posted_date, deadline, status 
			  FROM jobs 
			  WHERE id = $1`
	
	var job data.Job
	err := repo.DB.QueryRow(query, id).Scan(
		&job.ID, 
		&job.Title, 
		&job.Description, 
		&job.Requirements,
		&job.Department,
		&job.Location,
		&job.JobType,
		&job.Salary,
		&job.PostedDate,
		&job.Deadline,
		&job.Status)
	
	return job, err
}

// Update job
func (repo *Repository) UpdateJob(job data.Job) error {
	query := `UPDATE jobs 
			  SET title = $1, description = $2, requirements = $3, department = $4, location = $5, 
			      job_type = $6, salary = $7, deadline = $8, status = $9
			  WHERE id = $10`
	
	_, err := repo.DB.Exec(query, 
		job.Title, 
		job.Description, 
		job.Requirements,
		job.Department,
		job.Location,
		job.JobType,
		job.Salary,
		job.Deadline,
		job.Status,
		job.ID)
	
	return err
}

// Delete job
func (repo *Repository) DeleteJob(id int) error {
	query := `DELETE FROM jobs WHERE id = $1`
	_, err := repo.DB.Exec(query, id)
	return err
}

// Get internal applications by job ID
func (repo *Repository) GetInternalApplicationsByJobID(jobID string) ([]data.InternalEmployee, error) {
	query := `SELECT first_name, last_name, other_bank_exp, jobid, resumepath 
			  FROM internal_applications 
			  WHERE jobid = $1`
	
	rows, err := repo.DB.Query(query, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var applications []data.InternalEmployee
	for rows.Next() {
		var app data.InternalEmployee
		err := rows.Scan(&app.FirstName, &app.LastName, &app.OtherBankExp, &app.Jobid, &app.Resumepath)
		if err != nil {
			return nil, err
		}
		applications = append(applications, app)
	}
	
	return applications, nil
}

// Get external applications by job ID
func (repo *Repository) GetExternalApplicationsByJobID(jobID string) ([]data.ExternalEmployee, error) {
	query := `SELECT first_name, last_name, email, phone, jobid, other_job_exp, other_job_exp_year, resumepath 
			  FROM external_applications 
			  WHERE jobid = $1`
	
	rows, err := repo.DB.Query(query, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var applications []data.ExternalEmployee
	for rows.Next() {
		var app data.ExternalEmployee
		err := rows.Scan(&app.FirstName, &app.LastName, &app.Email, &app.Phone, &app.Jobid, &app.OtherJobExp, &app.OtherJobYear, &app.Resumepath)
		if err != nil {
			return nil, err
		}
		applications = append(applications, app)
	}
	
	return applications, nil
}

// Create the jobs table
func (repo *Repository) CreateJobsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS jobs (
		id SERIAL PRIMARY KEY,
		title VARCHAR(100) NOT NULL,
		description TEXT NOT NULL,
		requirements TEXT,
		department VARCHAR(100) NOT NULL,
		location VARCHAR(100),
		job_type VARCHAR(50) NOT NULL,
		salary VARCHAR(50),
		posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		deadline TIMESTAMP,
		status VARCHAR(20) DEFAULT 'open'
	)`
	
	_, err := repo.DB.Exec(query)
	return err
}

// Get jobs by type
func (repo *Repository) GetJobByType(jobType string) ([]data.Job, error) {
	query := `SELECT id, title, description, requirements, department, location, job_type, salary, posted_date, deadline, status 
			  FROM jobs 
			  WHERE job_type = $1
			  ORDER BY posted_date DESC`
	
	rows, err := repo.DB.Query(query, jobType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var jobs []data.Job
	for rows.Next() {
		var job data.Job
		err := rows.Scan(
			&job.ID, 
			&job.Title, 
			&job.Description, 
			&job.Requirements,
			&job.Department,
			&job.Location,
			&job.JobType,
			&job.Salary,
			&job.PostedDate,
			&job.Deadline,
			&job.Status)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	
	return jobs, nil
} 