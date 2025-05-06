package service
import(
	"github.com/brehan/bank/cmd/data"

	
	//"github.com/gin-gonic/gin"

	"errors"
	"time"
)

type EmployeeService interface {
    ValidateEmployee(emp data.Employee) error
  
}

type DefaultEmployeeService struct{}
func (empser *DefaultEmployeeService)EmployeeService(emp data.Employee)error{
	if emp.Id==nil{
		return errors.New("id is required")
	
	if emp.FileNumber==""{
		return errors.New("file number is required")
	}
	if emp.FullName==""{
		return errors.New("full name is required")
	}
	if emp.Sex==""{
		return errors.New("sex is required")
	}
	if   emp.EmploymentDate.IsZero(){
		return errors.New("employment date is required")
	}
	return nil


}