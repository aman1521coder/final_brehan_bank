package repository
import (
	"github.com/brehan/bank/cmd/data"
)
func (repo *Repository)GetEmployeeById(id int)(data.Employee,error){
	var emp data.Employee
	query := `SELECT * FROM Employee WHERE id = $1`
	err := repo.DB.QueryRow(query, id).Scan(&emp.ID, &emp.FileNumber, &emp.FullName, &emp.Sex, &emp.EmploymentDate, &emp.IndividualPMS, &emp.LastDoP, &emp.JobGrade, &emp.NewSalary, &emp.JobCategory, &emp.CurrentPosition, &emp.Branch, &emp.Department, &emp.District, &emp.TwinBranch, &emp.Region, &emp.FieldOfStudy, &emp.EducationalLevel, &emp.Cluster, &emp.Indpms25, &emp.Totalexp20, &emp.Totalexp, &emp.Relatedexp, &emp.Expafterpromo, &emp.Tmdrec20, &emp.Disrect15, &emp.Total)
	if err != nil {
		return emp, err
	}
	return emp, nil
}
func (repo *Repository)GetEmployeeByFileNumber(fileNumber string)(data.Employee,error){
	var emp data.Employee
	query := `SELECT * FROM Employee WHERE file_number = $1`
	err := repo.DB.QueryRow(query, fileNumber).Scan(&emp.ID, &emp.FileNumber, &emp.FullName, &emp.Sex, &emp.EmploymentDate, &emp.IndividualPMS, &emp.LastDoP, &emp.JobGrade, &emp.NewSalary, &emp.JobCategory, &emp.CurrentPosition, &emp.Branch, &emp.Department, &emp.District, &emp.TwinBranch, &emp.Region, &emp.FieldOfStudy, &emp.EducationalLevel, &emp.Cluster, &emp.Indpms25, &emp.Totalexp20, &emp.Totalexp, &emp.Relatedexp, &emp.Expafterpromo, &emp.Tmdrec20, &emp.Disrect15, &emp.Total)
	if err != nil {
		return emp, err
	}
	return emp, nil
}
func (repo *Repository) CreateEmployee(emp data.Employee) error {
    query := `INSERT INTO Employee (
        file_number, full_name, sex, employment_date, individual_pms, last_dop, job_grade,
        new_salary, job_category, new_position, branch, department, district, twin_branch,
        region, field_of_study, educational_level, cluster, indpms25, totalexp20, totalexp,
        relatedexp, expafterpromo, tmdrec20, disrec20, total
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)`
    _, err := repo.DB.Exec(query,
        emp.FileNumber, emp.FullName, emp.Sex, emp.EmploymentDate, emp.IndividualPMS,
        emp.LastDoP, emp.JobGrade, emp.NewSalary, emp.JobCategory, emp.CurrentPosition,
        emp.Branch, emp.Department, emp.District, emp.TwinBranch, emp.Region,
        emp.FieldOfStudy, emp.EducationalLevel, emp.Cluster, emp.Indpms25, emp.Totalexp20,
        emp.Totalexp, emp.Relatedexp, emp.Expafterpromo, emp.Tmdrec20, emp.Disrect15, emp.Total,
    )
    if err != nil {
        return err
    }
    return nil
}