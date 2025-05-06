package main
import(
	"golang.org/x/crypto/bcrypt"

)
func (app *Application)hashpassword(password string)(string,error){
	hash,err:=bcrypt.GenerateFromPassword([]byte(password),bcrypt.DefaultCost)
	if err!=nil{
		return "",err
	}
	return string(hash),nil
}
func (app *Application)verfiypassword(password string,hash string)(bool,error){
	err:=bcrypt.CompareHashAndPassword([]byte(hash),[]byte(password))
	if err!=nil{
		return false,err
	}
	return true ,nil
}