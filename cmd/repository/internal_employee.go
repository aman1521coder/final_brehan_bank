
package repository

import (
	"github.com/brehan/bank/cmd/data"
)


func (repo *Repository) ApplyInternal(emp data.InternalEmployee) error {
	query := `
		INSERT INTO InternalEmployee (first_name, last_name, jobid, other_bank_exp, resumepath)
		VALUES ($1, $2, $3, $4, $5)`

	_, err := repo.DB.Exec(query,
		emp.FirstName,
		emp.LastName,
		emp.Jobid,
		emp.OtherBankExp,
		emp.Resumepath,
	)

	return err
}

func (repo *Repository) GetInternalEmployeeById(id int)(data.InternalEmployee,error){
var emp data.InternalEmployee
query := `SELECT * FROM InternalEmployee WHERE jobid = $1`
err := repo.DB.QueryRow(query, id).Scan( &emp.FirstName, &emp.LastName, &emp.OtherBankExp, &emp.Jobid, &emp.Resumepath)
if err != nil {
	return emp, err	
}
return emp, nil


}