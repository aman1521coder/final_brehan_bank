package service

import (
    "errors"


    "github.com/brehan/bank/cmd/data"
    "github.com/brehan/bank/cmd/repository"
)

type EmployeeService interface {
    ValidateEmployee(emp data.Employee) error
    CreateEmployee(emp data.Employee) error
    GetEmployeeById(id int) (data.Employee, error)
    GetEmployeeByFileNumber(fileNumber string) (data.Employee, error)
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
    if err := empser.ValidateEmployee(emp); err != nil {
        return err
    }
    return empser.repo.CreateEmployee(emp) 
}


func (empser *DefaultEmployeeService) GetEmployeeById(id int) (data.Employee, error) {
    return empser.repo.GetEmployeeById(id)
}


func (empser *DefaultEmployeeService) GetEmployeeByFileNumber(fileNumber string) (data.Employee, error) {
    return empser.repo.GetEmployeeByFileNumber(fileNumber)
}