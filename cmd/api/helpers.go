package main
import(
	"golang.org/x/crypto/bcrypt"
	"os"
	"errors"
	"regexp"
	"fmt"

	

)

const (
    TwoMB = 2 * 1024 * 1024 // 2MB in bytes (2,097,152 bytes)
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
func(app *Application) saveresume(name string ,pdf []byte)error{
	filepath:="/home/oem/Desktop/final_brehan_project/cmd/static/resumes/"+name+".pdf"

	file,err:=os.Create(filepath)
	if err!=nil{
		return err
	}
	if len(pdf)>TwoMB{
		return errors.New("resume is too large")
	}
	_,err=file.Write(pdf)
	if err!=nil{
		return err
	}
	err=file.Close()
	if err!=nil{
		return err
	}
return nil

}
func sanitizeFileName(name string) (string, error) {
    reg, err := regexp.Compile(`[^a-zA-Z0-9_-]+`)
    if err != nil {
        return "", fmt.Errorf("failed to compile regex: %w", err)
    }
    safeName := reg.ReplaceAllString(name, "")
    if safeName == "" {
        return "", errors.New("filename is empty or contains only invalid characters")
    }
    if len(safeName) > 255 {
        safeName = safeName[:255]
    }
    return safeName, nil
}