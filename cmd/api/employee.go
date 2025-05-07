package main
import(
	"github.com/gin-gonic/gin"
	"github.com/brehan/bank/cmd/service"
    "github.com/brehan/bank/cmd/data"

)


func (app *Application)editmployee(c *gin.Context){
var emp data.Employee

if app.EmployeeService.CreateEmployee(emp)==nil{
err:=c.ShouldBind(&emp)
if err!=nil{{
	c.JSON(400,gin.H{
		"error":"Invalid request",
	})
}

}

	
}}
