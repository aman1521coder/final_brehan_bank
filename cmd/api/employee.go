package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/brehan/bank/cmd/data"
)

// ===== Core Employee Management Handlers =====

// Get employee by ID
func (app *Application) getEmployeeById(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	employee, err := app.employeeService.GetEmployeeById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}

	c.JSON(http.StatusOK, employee)
}

// Get all employees
func (app *Application) getAllEmployees(c *gin.Context) {
	employees, err := app.employeeService.GetAllEmployees()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, employees)
}

// Create new employee
func (app *Application) createEmployee(c *gin.Context) {
	var emp data.Employee
	if err := c.ShouldBindJSON(&emp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := app.employeeService.CreateEmployee(emp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Employee created successfully"})
}

// Update employee (admin only)
func (app *Application) updateEmployee(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	var emp data.Employee
	if err := c.ShouldBindJSON(&emp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Ensure ID matches
	emp.ID = id

	// First get existing employee to preserve fields not included in the request
	existingEmp, err := app.employeeService.GetEmployeeById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}
	
	// Update fields that were provided (this is simplified, you might need more logic)
	if emp.FullName != "" {
		existingEmp.FullName = emp.FullName
	}
	// Add other field updates as needed
	
	// Save the updated employee
	if err := app.employeeService.UpdateEmployeeManagerInputs(id, existingEmp.IndividualPMS, existingEmp.Disrect15); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Employee updated successfully"})
}

// ===== Manager Evaluation Handlers =====

// Update employee PMS (manager only)
func (app *Application) updateEmployeePMS(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	var input struct {
		IndividualPMS float64 `json:"individual_pms"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := app.employeeService.UpdateEmployeePMS(id, input.IndividualPMS); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "PMS updated successfully"})
}

// ===== District Manager Handlers =====

// Update employee district recommendation (district manager only)
func (app *Application) updateEmployeeDistrictRec(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	var input struct {
		DistrictRec float64 `json:"district_rec"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Get the district manager's branch from the authenticated user
	managerBranch := c.GetString("user_branch")
	if managerBranch == "" {
		// For testing purposes - you should remove this in production
		managerBranch = c.Query("branch")
		if managerBranch == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing branch information"})
			return
		}
	}

	if err := app.employeeService.UpdateEmployeeDistrictRec(id, input.DistrictRec, managerBranch); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "District recommendation updated successfully"})
}

// Get employee for district manager (limited info)
func (app *Application) getEmployeeForDistrictManager(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}
	
	// Get the district manager's branch from the authenticated user
	managerBranch := c.GetString("user_branch")
	if managerBranch == "" {
		// For testing purposes - you should remove this in production
		managerBranch = c.Query("branch")
		if managerBranch == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing branch information"})
			return
		}
	}

	employee, err := app.employeeService.GetEmployeeForDistrictManager(id, managerBranch)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, employee)
}

// Get all employees for district manager (limited info, filtered by branch)
func (app *Application) getEmployeesForDistrictManager(c *gin.Context) {
	// Get the district manager's branch from the authenticated user
	managerBranch := c.GetString("user_branch")
	if managerBranch == "" {
		// For testing purposes - you should remove this in production
		managerBranch = c.Query("branch")
		if managerBranch == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing branch information"})
			return
		}
	}

	employees, err := app.employeeService.GetEmployeesByBranch(managerBranch)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, employees)
}