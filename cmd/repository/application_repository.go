package repository

import (
	"github.com/brehan/bank/cmd/data"
)

// Get all internal applications
func (repo *Repository) GetAllInternalApplications() ([]data.InternalEmployee, error) {
	query := `SELECT id, first_name, last_name, other_bank_exp, jobid, resume_path 
			  FROM internalemployee`
	
	rows, err := repo.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var applications []data.InternalEmployee
	for rows.Next() {
		var app data.InternalEmployee
		var id string
		err := rows.Scan(&id, &app.FirstName, &app.LastName, &app.OtherBankExp, &app.Jobid, &app.Resumepath)
		if err != nil {
			return nil, err
		}
		applications = append(applications, app)
	}
	
	return applications, nil
}

// Get all external applications
func (repo *Repository) GetAllExternalApplications() ([]data.ExternalEmployee, error) {
	query := `SELECT id, first_name, last_name, email, phone, jobid, other_job_exp, other_job_exp_year, resume_path 
			  FROM externalemployee`
	
	rows, err := repo.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var applications []data.ExternalEmployee
	for rows.Next() {
		var app data.ExternalEmployee
		var id string
		err := rows.Scan(&id, &app.FirstName, &app.LastName, &app.Email, &app.Phone, &app.Jobid, 
			&app.OtherJobExp, &app.OtherJobYear, &app.Resumepath)
		if err != nil {
			return nil, err
		}
		applications = append(applications, app)
	}
	
	return applications, nil
}

// Apply for a job (internal employee)
func (repo *Repository) ApplyInternal(internalApp data.InternalEmployee) error {
	query := `INSERT INTO internalemployee (first_name, last_name, jobid, other_bank_exp, resume_path)
			  VALUES ($1, $2, $3, $4, $5)`
	
	_, err := repo.DB.Exec(query, 
		internalApp.FirstName, 
		internalApp.LastName,
		internalApp.Jobid,
		internalApp.OtherBankExp,
		internalApp.Resumepath)
	
	return err
}

// Apply for a job (external applicant)
func (repo *Repository) ApplyExternal(externalApp data.ExternalEmployee) error {
	query := `INSERT INTO externalemployee (first_name, last_name, email, phone, jobid, other_job_exp, other_job_exp_year, resume_path)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	
	_, err := repo.DB.Exec(query, 
		externalApp.FirstName, 
		externalApp.LastName,
		externalApp.Email,
		externalApp.Phone,
		externalApp.Jobid,
		externalApp.OtherJobExp,
		externalApp.OtherJobYear,
		externalApp.Resumepath)
	
	return err
} 