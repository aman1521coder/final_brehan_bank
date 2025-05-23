package data 
import (
	"time"
	"database/sql"
)
type Employee struct {
	ID               int       `json:"id"`                 // ID No.
	FileNumber       string    `json:"file_number"`        // File No.
	FullName         string    `json:"full_name"`          // Name Of Employee
	
	Sex              string    `json:"sex"`                // Sex
	EmploymentDate   *time.Time `json:"employment_date"`    // Employment Date
	DoE              *time.Time `json:"doe"`                // DoE
	IndividualPMS    sql.NullFloat64   `json:"individual_pms"`     // Ind PMS
	LastDoP          *time.Time `json:"last_dop"`           // LDoP
	JobGrade         string    `json:"job_grade"`          // New JG
	NewSalary        sql.NullFloat64   `json:"new_salary"`         // New Salary
	JobCategory      string    `json:"job_category"`       // Job Category
	CurrentPosition      string    `json:"new_position"`       // currnetPosition
	Branch           string    `json:"branch"`             // Branch
	Department       string    `json:"department"`         // Department
	District         string    `json:"district"`           // District
	TwinBranch       sql.NullString    `json:"twin_branch"`        // Twin Branch
	Region           string    `json:"region"`             // Region
	FieldOfStudy     string    `json:"field_of_study"`     // Field of Study
	EducationalLevel string    `json:"educational_level"`  // Educational Level
	Cluster          sql.NullString    `json:"cluster"`            // Cluster
	Indpms25        sql.NullFloat64   `json:"indpms25"`          // Ind PMS 25%
	Totalexp20    sql.NullFloat64   `json:"totalexp20"`        // Total Exp 20% 
	Totalexp     sql.NullInt64       `json:"totalexp"`          // Total Exp
	Relatedexp sql.NullInt64       `json:"relatedexp"`         // Related Exp 
	Expafterpromo sql.NullFloat64   `json:"expafterpromo"`     // Exp After Promo  for largest 
	Tmdrec20 sql.NullFloat64   `json:"tmdrec20"`            // TMD Rec 20%
	Disrec15 sql.NullFloat64   `json:"disrec15"`            // DIS Rec 15%
	Total sql.NullFloat64   `json:"total"`                // Total sum of pms25%  and related exp and lastdateofpm
}