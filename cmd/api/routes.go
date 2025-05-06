package main
import( "github.com/gin-gonic/gin")
func (app *Application)routes() *gin.Engine{
	r:=gin.Default()
	r.GET("/ping",func(c *gin.Context){
		c.JSON(200,gin.H{
			"message":"pong",
		})
	})
	//r.GET("/internal_employee",app.internalEmployee)
return r
}
