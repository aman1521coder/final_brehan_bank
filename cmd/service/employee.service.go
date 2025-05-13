package service

import (
	"errors"
	"time"

	"github.com/brehan/bank/cmd/data"
	"github.com/brehan/bank/cmd/repository"
)

type EmployeeService interface {
    ValidateEmployee(emp data.Employee) error
    CreateEmployee(emp data.Employee) error
    GetEmployeeById(id int) (data.Employee, error)
    GetEmployeeByFileNumber(fileNumber string) (data.Employee, error)
    GetAllEmployees() ([]data.Employee, error)
    UpdateEmployeeManagerInputs(id int, individualPMS float64, districtRec float64) error
    UpdateEmployeePMS(id int, individualPMS float64) error
    UpdateEmployeeDistrictRec(id int, districtRec float64, managerBranch string) error
    GetEmployeeForDistrictManager(id int, managerBranch string) (data.Employee, error)
    GetEmployeesByBranch(branch string) ([]data.Employee, error)
}

type DefaultEmployeeService struct {
    repo *repository.Repository // Add repository instance
}

// NewEmployeeService creates a new DefaultEmployeeService with a repository
func NewEmployeeService(repo *repository.Repository) *DefaultEmployeeService {
    return &DefaultEmployeeService{repo: repo}
}


func (empser *DefaultEmployeeService) ValidateEmployee(emp data.Employee) error {
    if  emp.ID <= 0 {
        return errors.New("id is required and must be positive")
    }
    if emp.FileNumber == "" {
        return errors.New("file number is required")
    }
    if emp.FullName == "" {
        return errors.New("full name is required")
    }
    if emp.Sex == "" {
        return errors.New("sex is required")
    }
    if emp.EmploymentDate.IsZero() {
        return errors.New("employment date is required")
    }
    if emp.Sex != "Male" && emp.Sex != "Female" {
        return errors.New("sex must be 'Male' or 'Female'")
    }
 

    return nil
}

func (empser *DefaultEmployeeService) CreateEmployee(emp data.Employee) error {
    // Validate required fields
    if err := empser.ValidateEmployee(emp); err != nil {
        return err
    }

    currentYear := time.Now().Year()

    // Compute raw experience values
    emp.Totalexp = currentYear - emp.EmploymentDate.Year()
    emp.Relatedexp = currentYear - emp.LastDoP.Year()

    // Fetch max values from database
    maxTotalExp, maxRelatedExp, _, err := empser.repo.GetmaxValuesofexp(emp)
    if err != nil {
        return err
    }


    if maxTotalExp > 0 {
        emp.Totalexp20 = (float64(emp.Totalexp) / float64(maxTotalExp)) * 20.0
    }

   
    if maxRelatedExp > 0 {
        emp.Expafterpromo = (float64(emp.Relatedexp) / float64(maxRelatedExp)) * 10.0
    }
    
    // Calculate IndividualPMS score (25%)
    imps := emp.IndividualPMS
    if imps > 0 {
        emp.Indpms25 = imps * 25 / 100
    }
    
    // The Tmdrec20 (TMD Rec 20%) will be calculated based on total experience ranking
    // The highest total experience will get the highest score out of 20
    if maxTotalExp > 0 {
        emp.Tmdrec20 = (float64(emp.Totalexp) / float64(maxTotalExp)) * 20.0
    }
    
    // District manager recommendation (15%) is input directly

    // Calculate total score
    emp.Total = float32(emp.Indpms25 + emp.Totalexp20 + emp.Expafterpromo + emp.Tmdrec20 + emp.Disrect15)

    // Finally, create the employee
    return empser.repo.CreateEmployee(emp)
}

// Add method to update employee with manager inputs
func (empser *DefaultEmployeeService) UpdateEmployeeManagerInputs(id int, individualPMS float64, districtRec float64) error {
    // Get the employee by ID
    emp, err := empser.GetEmployeeById(id)
    if err != nil {
        return err
    }
    
    // Update the manager inputs
    emp.IndividualPMS = individualPMS
    emp.Disrect15 = districtRec
    
    // Recalculate derived values
    if individualPMS > 0 {
        emp.Indpms25 = individualPMS * 25 / 100
    }
    
    // Update the total score
    emp.Total = float32(emp.Indpms25 + emp.Totalexp20 + emp.Expafterpromo + emp.Tmdrec20 + emp.Disrect15)
    
    // Update the employee in the database
    return empser.repo.UpdateEmployee(emp)
}

// Update only Individual PMS (for managers)
func (empser *DefaultEmployeeService) UpdateEmployeePMS(id int, individualPMS float64) error {
    // Get the employee by ID
    emp, err := empser.GetEmployeeById(id)
    if err != nil {
        return err
    }
    
    // Update only the IndividualPMS
    emp.IndividualPMS = individualPMS
    
    // Recalculate PMS score (25%)
    if individualPMS > 0 {
        emp.Indpms25 = individualPMS * 25 / 100
    }
    
    // Update the total score
    emp.Total = float32(emp.Indpms25 + emp.Totalexp20 + emp.Expafterpromo + emp.Tmdrec20 + emp.Disrect15)
    
    // Update the employee in the database
    return empser.repo.UpdateEmployee(emp)
}

// Update only District Recommendation (for district managers)
func (empser *DefaultEmployeeService) UpdateEmployeeDistrictRec(id int, districtRec float64, managerBranch string) error {
    // Get the employee by ID
    emp, err := empser.GetEmployeeById(id)
    if err != nil {
        return err
    }
    
    // Check if manager is from the same branch
    if emp.Branch != managerBranch {
        return errors.New("district manager can only update employees from the same branch")
    }
    
    // Update only the District Recommendation
    emp.Disrect15 = districtRec
    
    // Update the total score
    emp.Total = float32(emp.Indpms25 + emp.Totalexp20 + emp.Expafterpromo + emp.Tmdrec20 + emp.Disrect15)
    
    // Update the employee in the database
    return empser.repo.UpdateEmployee(emp)
}

func (empser *DefaultEmployeeService) GetEmployeeById(id int) (data.Employee, error) {
    return empser.repo.GetEmployeeById(id)
}


func (empser *DefaultEmployeeService) GetEmployeeByFileNumber(fileNumber string) (data.Employee, error) {
    return empser.repo.GetEmployeeByFileNumber(fileNumber)
}
func (empser *DefaultEmployeeService) GetAllEmployees() ([]data.Employee, error) {
    return empser.repo.GetAllEmployees()
}

// Get limited employee data for district managers
func (empser *DefaultEmployeeService) GetEmployeeForDistrictManager(id int, managerBranch string) (data.Employee, error) {
    // Get the employee by ID
    emp, err := empser.GetEmployeeById(id)
    if err != nil {
        return data.Employee{}, err
    }
    
    // Check if manager is from the same branch
    if emp.Branch != managerBranch {
        return data.Employee{}, errors.New("district manager can only view employees from the same branch")
    }
    
    // Return limited information
    limitedEmp := data.Employee{
        ID:       emp.ID,
        FullName: emp.FullName,
        Branch:   emp.Branch,
        // Only include fields needed by district managers
    }
    
    return limitedEmp, nil
}

// Get all employees for a specific branch (for district managers)
func (empser *DefaultEmployeeService) GetEmployeesByBranch(branch string) ([]data.Employee, error) {
    allEmployees, err := empser.repo.GetAllEmployees()
    if err != nil {
        return nil, err
    }
    
    // Filter employees by branch and return limited information
    var branchEmployees []data.Employee
    for _, emp := range allEmployees {
        if emp.Branch == branch {
            // Only include necessary fields
            limitedEmp := data.Employee{
                ID:       emp.ID,
                FullName: emp.FullName,
                Branch:   emp.Branch,
                // Add other fields that district managers need to see
            }
            branchEmployees = append(branchEmployees, limitedEmp)
        }
    }
    
    return branchEmployees, nil
}