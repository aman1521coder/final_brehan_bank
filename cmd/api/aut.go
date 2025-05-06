package main
import(
	"github.com/gin-gonic/gin"
	"github.com/brehan/bank/cmd/data"
	"github.com/"

	"github.com/golang-jwt/jwt/v5"

)
var jwtKey = []byte("secret")
type Adminclaim struct {
	Username string `json:"username"`
	Password string `json:"password"`
}


func (app *Application)loginadmin(c *gin.Context){
err:=c.ShouldBindJSON(&Adminclaim)
if err!=nil{
	c.JSON(400,gin.H{
		"message":"Invalid request",
	})
	app.log.Printf("Invalid request", err)
}

}
