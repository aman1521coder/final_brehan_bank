package repository

import (
	"github.com/brehan/bank/cmd/data"
)

// GetEmployeesByName searches for employees by their name
func (repo *Repository) GetEmployeesByName(name string) ([]data.Employee, error) {
	query := `SELECT * FROM employees WHERE full_name ILIKE $1`
	rows, err := repo.DB.Query(query, "%"+name+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var employees []data.Employee
	for rows.Next() {
		var emp data.Employee
		err := rows.Scan(
			&emp.ID,
			&emp.FileNumber,
			&emp.FullName,
			&emp.Sex,
			&emp.EmploymentDate,
			&emp.DoE,
			&emp.IndividualPMS,
			&emp.LastDoP,
			&emp.JobGrade,
			&emp.NewSalary,
			&emp.JobCategory,
			&emp.CurrentPosition,
			&emp.Branch,
			&emp.Department,
			&emp.District,
			&emp.TwinBranch,
			&emp.Region,
			&emp.FieldOfStudy,
			&emp.EducationalLevel,
			&emp.Cluster,
			&emp.Indpms25,
			&emp.Totalexp20,
			&emp.Totalexp,
			&emp.Relatedexp,
			&emp.Expafterpromo,
			&emp.Tmdrec20,
			&emp.Disrect15,
			&emp.Total,
		)
		if err != nil {
			return nil, err
		}
		employees = append(employees, emp)
	}
	
	return employees, nil
}

// UpdateEmployeeIndividualPMS updates the Individual PMS score for an employee
func (repo *Repository) UpdateEmployeeIndividualPMS(employeeID int, pmsScore float64) error {
	// Calculate the Indpms25 value (25% of PMS score)
	indPms25 := pmsScore * 0.25
	
	query := `UPDATE employees 
			  SET individual_pms = $1, indpms25 = $2
			  WHERE id = $3`
	
	_, err := repo.DB.Exec(query, pmsScore, indPms25, employeeID)
	if err != nil {
		return err
	}
	
	// After updating, recalculate the total score
	return repo.RecalculateEmployeeTotal(employeeID)
}

// UpdateEmployeeManagerRecommendation updates the Manager Recommendation score for an employee
func (repo *Repository) UpdateEmployeeManagerRecommendation(employeeID int, recScore float64) error {
	// tmdrec20 is the actual field (20% weight)
	tmdrec20 := recScore * 0.20
	
	query := `UPDATE employees 
			  SET tmdrec20 = $1
			  WHERE id = $2`
	
	_, err := repo.DB.Exec(query, tmdrec20, employeeID)
	if err != nil {
		return err
	}
	
	// After updating, recalculate the total score
	return repo.RecalculateEmployeeTotal(employeeID)
}

// UpdateEmployeeDistrictRecommendation updates the District Recommendation score for an employee
func (repo *Repository) UpdateEmployeeDistrictRecommendation(employeeID int, recScore float64) error {
	// disrect15 is the actual field (15% weight)
	disrect15 := recScore * 0.15
	
	query := `UPDATE employees 
			  SET disrect15 = $1
			  WHERE id = $2`
	
	_, err := repo.DB.Exec(query, disrect15, employeeID)
	if err != nil {
		return err
	}
	
	// After updating, recalculate the total score
	return repo.RecalculateEmployeeTotal(employeeID)
}

// CalculateExperienceScore calculates the experience score based on total and related experience
func (repo *Repository) CalculateExperienceScore(employeeID int) error {
	// Get the employee to calculate based on totalexp and relatedexp
	employee, err := repo.GetEmployeeByID(employeeID)
	if err != nil {
		return err
	}
	
	var totalExpScore float64
	
	// Ensure totalexp is valid
	if employee.Totalexp.Valid {
		// Calculate 20% of experience
		totalExpScore = float64(employee.Totalexp.Int64) * 0.20
	}
	
	query := `UPDATE employees 
			  SET totalexp20 = $1
			  WHERE id = $2`
	
	_, err = repo.DB.Exec(query, totalExpScore, employeeID)
	if err != nil {
		return err
	}
	
	return repo.RecalculateEmployeeTotal(employeeID)
}

// RecalculateEmployeeTotal recalculates the total score from all components
func (repo *Repository) RecalculateEmployeeTotal(employeeID int) error {
	query := `
		UPDATE employees 
		SET total = COALESCE(indpms25, 0) + COALESCE(totalexp20, 0) + COALESCE(tmdrec20, 0) + COALESCE(disrect15, 0)
		WHERE id = $1
	`
	
	_, err := repo.DB.Exec(query, employeeID)
	return err
}

// AutoMatchInternalApplication automatically matches an internal application with an employee
// and initiates the evaluation process
func (repo *Repository) AutoMatchInternalApplication(application data.InternalEmployee) (data.Employee, error) {
	fullName := application.FirstName + " " + application.LastName
	
	// Try to find the employee by name
	employees, err := repo.GetEmployeesByName(fullName)
	if err != nil || len(employees) == 0 {
		return data.Employee{}, err
	}
	
	// Match with the first employee found
	matchedEmployee := employees[0]
	
	// Update the application with the matched employee ID
	query := `
		UPDATE internal_applications
		SET matched_employee_id = $1, promotion_status = 'pending'
		WHERE first_name = $2 AND last_name = $3 AND jobid = $4
	`
	
	_, err = repo.DB.Exec(query, 
		matchedEmployee.ID, 
		application.FirstName, 
		application.LastName,
		application.Jobid)
	
	if err != nil {
		return matchedEmployee, err
	}
	
	// Start with a clean evaluation by initializing scores
	err = repo.InitializeEmployeeEvaluation(matchedEmployee.ID)
	
	return matchedEmployee, err
}

// InitializeEmployeeEvaluation resets evaluation scores for a new promotion cycle
func (repo *Repository) InitializeEmployeeEvaluation(employeeID int) error {
	query := `
		UPDATE employees
		SET indpms25 = NULL, totalexp20 = NULL, tmdrec20 = NULL, disrect15 = NULL, total = NULL
		WHERE id = $1
	`
	
	_, err := repo.DB.Exec(query, employeeID)
	return err
}

// GetEmployeeByID retrieves an employee by their ID
func (repo *Repository) GetEmployeeByID(id int) (data.Employee, error) {
	var employee data.Employee
	
	query := `
		SELECT id, file_number, full_name, sex, job_grade, job_category, 
			   branch, department, district, region, educational_level, field_of_study,
			   current_position, totalexp, indpms25, totalexp20, tmdrec20, disrect15, total
		FROM employees 
		WHERE id = $1
	`
	
	err := repo.DB.QueryRow(query, id).Scan(
		&employee.ID,
		&employee.FileNumber,
		&employee.FullName,
		&employee.Sex,
		&employee.JobGrade,
		&employee.JobCategory,
		&employee.Branch,
		&employee.Department,
		&employee.District,
		&employee.Region,
		&employee.EducationalLevel,
		&employee.FieldOfStudy,
		&employee.CurrentPosition,
		&employee.Totalexp,
		&employee.Indpms25,
		&employee.Totalexp20,
		&employee.Tmdrec20,
		&employee.Disrect15,
		&employee.Total,
	)
	
	if err != nil {
		return data.Employee{}, err
	}
	
	return employee, nil
} 