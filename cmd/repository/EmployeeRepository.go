package repository

import (
	"fmt"

	"github.com/brehan/bank/cmd/data"
)

func (repo *Repository) GetEmployeesByID(id int) (data.Employee, error) {
	query := `SELECT * FROM employee WHERE id = $1`
	row := repo.DB.QueryRow(query, id)

	var employee data.Employee
	err := row.Scan(
		&employee.ID,
		&employee.FileNumber,
		&employee.FullName,
		&employee.Sex,
		&employee.EmploymentDate,
		&employee.DoE,
		&employee.IndividualPMS,
		&employee.LastDoP,
		&employee.JobGrade,
		&employee.NewSalary,
		&employee.JobCategory,
		&employee.CurrentPosition,
		&employee.Branch,
		&employee.Department,
		&employee.District,
		&employee.TwinBranch,
		&employee.Region,
		&employee.FieldOfStudy,
		&employee.EducationalLevel,
		&employee.Cluster,
		&employee.Indpms25,
		&employee.Totalexp20,
		&employee.Totalexp,
		&employee.Relatedexp,
		&employee.Expafterpromo,
		&employee.Tmdrec20,
		&employee.Disrec15,
		&employee.Total)

	return employee, err
}

// get employee by file number
func (repo *Repository) GetEmployeeByFileNumber(name string) (data.Employee, error) {
	var emp data.Employee
	query := `SELECT * FROM employee WHERE file_number = $1`
	err := repo.DB.QueryRow(query, name).Scan(&emp.ID, &emp.FileNumber, &emp.FullName, &emp.Sex, &emp.EmploymentDate, &emp.DoE, &emp.IndividualPMS, &emp.LastDoP, &emp.JobGrade, &emp.NewSalary, &emp.JobCategory, &emp.CurrentPosition, &emp.Branch, &emp.Department, &emp.District, &emp.TwinBranch, &emp.Region, &emp.FieldOfStudy, &emp.EducationalLevel, &emp.Cluster, &emp.Indpms25, &emp.Totalexp20, &emp.Totalexp, &emp.Relatedexp, &emp.Expafterpromo, &emp.Tmdrec20, &emp.Disrec15, &emp.Total)
	if err != nil {
		return emp, err
	}
	return emp, err
}

// GetEmployeesByName searches for employees by their name
func (repo *Repository) GetEmployeesByName(name string) ([]data.Employee, error) {
	query := `SELECT * FROM employee WHERE full_name ILIKE $1`
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
			&emp.Disrec15,
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

	query := `UPDATE employee 
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

	query := `UPDATE employee 
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
	// disrec15 is the actual field (15% weight)
	disrec15 := recScore * 0.15

	query := `UPDATE employee 
			  SET disrec15 = $1
			  WHERE id = $2`

	_, err := repo.DB.Exec(query, disrec15, employeeID)
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

	query := `UPDATE employee 
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
		UPDATE employee 
		SET total = COALESCE(indpms25, 0) + COALESCE(totalexp20, 0) + COALESCE(tmdrec20, 0) + COALESCE(disrec15, 0)
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
		UPDATE employee
		SET indpms25 = NULL, totalexp20 = NULL, tmdrec20 = NULL, disrec15 = NULL, total = NULL
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
			   current_position, totalexp, indpms25, totalexp20, tmdrec20, disrec15, total
		FROM employee 
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
		&employee.Disrec15,
		&employee.Total,
	)

	if err != nil {
		return data.Employee{}, err
	}

	return employee, nil
}

func (repo *Repository) CreateEmployee(emp data.Employee) error {
	query := `INSERT INTO employee (
        file_number, full_name, sex, employment_date, individual_pms, last_dop, job_grade,
        new_salary, job_category, new_position, branch, department, district, twin_branch,
        region, field_of_study, educational_level, cluster, indpms25, totalexp20, totalexp,
        relatedexp, expafterpromo, tmdrec20, disrec15, total
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)`
	_, err := repo.DB.Exec(query,
		emp.FileNumber, emp.FullName, emp.Sex, emp.EmploymentDate, emp.IndividualPMS,
		emp.LastDoP, emp.JobGrade, emp.NewSalary, emp.JobCategory, emp.CurrentPosition,
		emp.Branch, emp.Department, emp.District, emp.TwinBranch, emp.Region,
		emp.FieldOfStudy, emp.EducationalLevel, emp.Cluster, emp.Indpms25, emp.Totalexp20,
		emp.Totalexp, emp.Relatedexp, emp.Expafterpromo, emp.Tmdrec20, emp.Disrec15, emp.Total,
	)
	if err != nil {
		return err
	}
	return nil
}

func (repo *Repository) GetmaxValuesofexp(emp data.Employee) (int, int, int, error) {
	var maxTotalExp int
	var maxRelatedExp int
	var maxTotalExp20 int
	query := `SELECT max(totalexp) as maxtotalexp, max(relatedexp) as maxrelatedexp, max(totalexp20) as maxtotalexp20 FROM employee`
	err := repo.DB.QueryRow(query).Scan(&maxTotalExp, &maxRelatedExp, &maxTotalExp20)
	if err != nil {
		return maxTotalExp, maxRelatedExp, maxTotalExp20, nil
	}
	return maxTotalExp, maxRelatedExp, maxTotalExp20, err
}

func (repo *Repository) UpdateEmployee(emp data.Employee) error {
	query := `UPDATE employee SET 
        file_number = $1, full_name = $2, sex = $3, employment_date = $4, individual_pms = $5, 
        last_dop = $6, job_grade = $7, new_salary = $8, job_category = $9, new_position = $10, 
        branch = $11, department = $12, district = $13, twin_branch = $14, region = $15,
        field_of_study = $16, educational_level = $17, cluster = $18, indpms25 = $19, 
        totalexp20 = $20, totalexp = $21, relatedexp = $22, expafterpromo = $23, 
        tmdrec20 = $24, disrec15 = $25, total = $26
    WHERE id = $27`

	_, err := repo.DB.Exec(query,
		emp.FileNumber, emp.FullName, emp.Sex, emp.EmploymentDate, emp.IndividualPMS,
		emp.LastDoP, emp.JobGrade, emp.NewSalary, emp.JobCategory, emp.CurrentPosition,
		emp.Branch, emp.Department, emp.District, emp.TwinBranch, emp.Region,
		emp.FieldOfStudy, emp.EducationalLevel, emp.Cluster, emp.Indpms25, emp.Totalexp20,
		emp.Totalexp, emp.Relatedexp, emp.Expafterpromo, emp.Tmdrec20, emp.Disrec15, emp.Total,
		emp.ID,
	)

	return err
}

func (repo *Repository) GetAllEmployees() ([]data.Employee, error) {
	var emps []data.Employee
	query := `SELECT id, file_number, full_name, sex, job_grade, job_category, 
			  branch, department, district, region, educational_level, field_of_study,
			  new_position, individual_pms, totalexp, indpms25, totalexp20, 
			  tmdrec20, disrec15, total 
			  FROM employee`

	rows, err := repo.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query employees: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var emp data.Employee
		err := rows.Scan(
			&emp.ID,
			&emp.FileNumber,
			&emp.FullName,
			&emp.Sex,
			&emp.JobGrade,
			&emp.JobCategory,
			&emp.Branch,
			&emp.Department,
			&emp.District,
			&emp.Region,
			&emp.EducationalLevel,
			&emp.FieldOfStudy,
			&emp.CurrentPosition,
			&emp.IndividualPMS,
			&emp.Totalexp,
			&emp.Indpms25,
			&emp.Totalexp20,
			&emp.Tmdrec20,
			&emp.Disrec15,
			&emp.Total,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan employee row: %v", err)
		}
		emps = append(emps, emp)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating employee rows: %v", err)
	}

	return emps, nil
}
