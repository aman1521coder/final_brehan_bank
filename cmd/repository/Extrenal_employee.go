package repository
import(
	"github.com/brehan/bank/cmd/data"
)
func (repo *Repository)ApplyExternal(emp data.ExternalEmployee) error{
	query := `INSERT INTO ExternalEmployee (first_name, last_name, email, phone, jobid, other_job_exp, other_job_exp_year, resumepath) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := repo.DB.Exec(query, emp.FirstName, emp.LastName, emp.Email, emp.Phone, emp.Jobid, emp.OtherJobExp, emp.Resumepath)
	return err
}
func (repo *Repository)GetExternalEmployeeById(id int)(data.ExternalEmployee,error){
	var emp data.ExternalEmployee
	query := `SELECT * FROM ExternalEmployee WHERE jobid = $1`	
	err := repo.DB.QueryRow(query, id).Scan(&emp.FirstName, &emp.LastName, &emp.Email, &emp.Phone, &emp.Jobid, &emp.OtherJobExp, &emp.OtherJobYear)
	if err != nil {
		return emp, err
	}
	return emp, nil
}