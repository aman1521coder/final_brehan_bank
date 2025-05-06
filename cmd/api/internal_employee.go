package main
import(
	"github.com/gin-gonic/gin"
)
func (app *Application)internalEmployee(c *gin.Context){
	c.JSON(200,gin.H{
		"message":"internal employee",
	})
}