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
func (repo *Repository)GetAllEmployees()([]data.Employee,error){
    var emps []data.Employee
    query := `SELECT * FROM Employee`
    err := repo.DB.QueryRow(query).Scan(&emps)
    if err != nil {
        return emps, err
    }
    return emps, nil
}
func (repo *Repository)GetmaxValuesofexp(emp data.Employee)(int,int,int,error){
    var maxTotalExp int
    var maxRelatedExp int
    var maxTotalExp20 int
    query := `SELECT max(totalexp) as maxtotalexp, max(relatedexp) as maxrelatedexp, max(totalexp20) as maxtotalexp20 FROM Employee`
    err := repo.DB.QueryRow(query).Scan(&maxTotalExp, &maxRelatedExp, &maxTotalExp20)
    if err != nil {
        return maxTotalExp, maxRelatedExp, maxTotalExp20,nil
    }
    return maxTotalExp, maxRelatedExp, maxTotalExp20,err
}
func (repo *Repository) UpdateEmployee(emp data.Employee) error {
    query := `UPDATE Employee SET 
        file_number = $1, full_name = $2, sex = $3, employment_date = $4, individual_pms = $5, 
        last_dop = $6, job_grade = $7, new_salary = $8, job_category = $9, new_position = $10, 
        branch = $11, department = $12, district = $13, twin_branch = $14, region = $15,
        field_of_study = $16, educational_level = $17, cluster = $18, indpms25 = $19, 
        totalexp20 = $20, totalexp = $21, relatedexp = $22, expafterpromo = $23, 
        tmdrec20 = $24, disrec20 = $25, total = $26
    WHERE id = $27`
    
    _, err := repo.DB.Exec(query,
        emp.FileNumber, emp.FullName, emp.Sex, emp.EmploymentDate, emp.IndividualPMS,
        emp.LastDoP, emp.JobGrade, emp.NewSalary, emp.JobCategory, emp.CurrentPosition,
        emp.Branch, emp.Department, emp.District, emp.TwinBranch, emp.Region,
        emp.FieldOfStudy, emp.EducationalLevel, emp.Cluster, emp.Indpms25, emp.Totalexp20,
        emp.Totalexp, emp.Relatedexp, emp.Expafterpromo, emp.Tmdrec20, emp.Disrect15, emp.Total,
        emp.ID,
    )
    
    return err
}