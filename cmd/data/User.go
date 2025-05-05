package data 
import(
	"time"
)
type User struct{
	Id string 
	Name string 
	Password string 

	createdAt time.Time
	updatedAt time.Time
}
type Admin struct{
	user User
 
}
type Manager struct{
	user User
 
}
type DistrictManager struct{
	user User
    Distrct string 
}