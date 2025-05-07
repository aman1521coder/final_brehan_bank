package data 
import (
	"time"
)
type Employee struct {
	ID               int   `json:"id"`                 // ID No.
	FileNumber       string    `json:"file_number"`        // File No.
	FullName         string    `json:"full_name"`          // Name Of Employee
	
	Sex              string    `json:"sex"`                // Sex
	EmploymentDate   time.Time `json:"employment_date"`    // Employment Date
	DoE              time.Time `json:"doe"`                // DoE
	IndividualPMS    float64   `json:"individual_pms"`     // Ind PMS
	LastDoP          time.Time `json:"last_dop"`           // LDoP
	JobGrade         string    `json:"job_grade"`          // New JG
	NewSalary        float64   `json:"new_salary"`         // New Salary
	JobCategory      string    `json:"job_category"`       // Job Category
	CurrentPosition      string    `json:"new_position"`       // currnetPosition
	Branch           string    `json:"branch"`             // Branch
	Department       string    `json:"department"`         // Department
	District         string    `json:"district"`           // District
	TwinBranch       string    `json:"twin_branch"`        // Twin Branch
	Region           string    `json:"region"`             // Region
	FieldOfStudy     string    `json:"field_of_study"`     // Field of Study
	EducationalLevel string    `json:"educational_level"`  // Educational Level
	Cluster          string    `json:"cluster"`            // Cluster
	Indpms25        float64   `json:"indpms25"`          // Ind PMS 25%
	Totalexp20    float64   `json:"totalexp20"`        // Total Exp 20%
	Totalexp     int       `json:"totalexp"`          // Total Exp
	Relatedexp int       `json:"relatedexp"`         // Related Exp 
	Expafterpromo float64   `json:"expafterpromo"`     // Exp After Promo
	Tmdrec20 float64   `json:"tmdrec20"`            // TMD Rec 20%
	Disrect15 float64   `json:"disrec20"`            // DIS Rec 15%
	Total float32   `json:"total"`                // Total sum of pms25%  and related exp and lastdateofpm
	

}