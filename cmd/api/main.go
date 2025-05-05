package main
import (
	"log"
"fmt"
"flag"
"os"

)
type config struct{
	port int
	env string 
	datasource string 
}
type application struct{
	config config
	log  *log.Logger


}
func main(){
var cgf config 
flag.IntVar(&cgf.port,"port",8080,"port")
flag.StringVar(&cgf.env,"env","dev","env")
flag.StringVar(&cgf.datasource,"datasource","postgresql://postgres:123@%23@localhost:5432/final_brehan_bank","datasource")
flag.Parse()
app:=application{
	config:cgf,
	log:log.New(os.Stdout,"",log.LstdFlags),
}
app.serve()

}
func (app *application) serve() {
    addr := fmt.Sprintf(":%d", app.config.port)
    app.log.Printf("Starting %s server on %s", app.config.env, addr)


  
    err := app.routes().Run(addr)
    if err != nil {
        app.log.Fatal(err)
    }
}