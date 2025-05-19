package main

import (
	"fmt"
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
		fmt.Printf("Error getting employees: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve employees"})
		return
	}

	// Convert SQL nullable fields to regular values before sending to frontend
	var response []gin.H
	for _, emp := range employees {
		// Create a map with only the necessary fields, converting nullable fields
		employeeData := gin.H{
			"id":               emp.ID,
			"file_number":      emp.FileNumber,
			"full_name":        emp.FullName,
			"sex":              emp.Sex,
			"job_grade":        emp.JobGrade,
			"job_category":     emp.JobCategory,
			"branch":           emp.Branch,
			"department":       emp.Department,
			"district":         emp.District,
			"region":           emp.Region,
			"educational_level": emp.EducationalLevel,
			"field_of_study":   emp.FieldOfStudy,
			"new_position":     emp.CurrentPosition,
		}
		
		// Handle nullable fields with proper type conversion
		if emp.IndividualPMS.Valid {
			employeeData["individual_pms"] = emp.IndividualPMS.Float64
		} else {
			employeeData["individual_pms"] = 0.0
		}
		
		if emp.Totalexp.Valid {
			employeeData["totalexp"] = emp.Totalexp.Int64
		} else {
			employeeData["totalexp"] = 0
		}
		
		if emp.Indpms25.Valid {
			employeeData["indpms25"] = emp.Indpms25.Float64
		} else {
			employeeData["indpms25"] = 0.0
		}
		
		if emp.Totalexp20.Valid {
			employeeData["totalexp20"] = emp.Totalexp20.Float64
		} else {
			employeeData["totalexp20"] = 0.0
		}
		
		if emp.Tmdrec20.Valid {
			employeeData["tmdrec20"] = emp.Tmdrec20.Float64
		} else {
			employeeData["tmdrec20"] = 0.0
		}
		
		if emp.Disrect15.Valid {
			employeeData["disrec20"] = emp.Disrect15.Float64
		} else {
			employeeData["disrec20"] = 0.0
		}
		
		if emp.Total.Valid {
			employeeData["total"] = emp.Total.Float64
		} else {
			employeeData["total"] = 0.0
		}
		
		response = append(response, employeeData)
	}

	c.JSON(http.StatusOK, response)
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
	
	// Extract float64 values from NullFloat64 types
	individualPMS := 0.0
	if existingEmp.IndividualPMS.Valid {
		individualPMS = existingEmp.IndividualPMS.Float64
	}
	
	districtRec := 0.0
	if existingEmp.Disrect15.Valid {
		districtRec = existingEmp.Disrect15.Float64
	}
	
	// Save the updated employee
	if err := app.employeeService.UpdateEmployeeManagerInputs(id, individualPMS, districtRec); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Employee updated successfully"})
}

// ===== Manager Evaluation Handlers =====

// Update employee Individual PMS score (Manager only)
func (app *Application) updateEmployeePMS(c *gin.Context) {
	employeeID := c.Param("id")
	id, err := strconv.Atoi(employeeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}
	
	// Check if the employee exists
	_, err = app.repo.GetEmployeeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}
	
	// Parse request body
	var req struct {
		IndividualPMS float64 `json:"individual_pms" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Validate score (between 0 and 100)
	if req.IndividualPMS < 0 || req.IndividualPMS > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "IndividualPMS score must be between 0 and 100"})
		return
	}
	
	// Update the PMS score
	err = app.repo.UpdateEmployeeIndividualPMS(id, req.IndividualPMS)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update PMS score"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Individual PMS score updated successfully"})
}

// Update employee manager recommendation (Manager only)
func (app *Application) updateEmployeeManagerRecommendation(c *gin.Context) {
	employeeID := c.Param("id")
	id, err := strconv.Atoi(employeeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}
	
	// Check if the employee exists
	_, err = app.repo.GetEmployeeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}
	
	// Parse request body
	var req struct {
		ManagerRecommendation float64 `json:"manager_recommendation" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Validate score (between 0 and 100)
	if req.ManagerRecommendation < 0 || req.ManagerRecommendation > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Manager recommendation score must be between 0 and 100"})
		return
	}
	
	// Update the recommendation score
	err = app.repo.UpdateEmployeeManagerRecommendation(id, req.ManagerRecommendation)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update manager recommendation"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Manager recommendation updated successfully"})
}

// Update employee district recommendation (District Manager only)
func (app *Application) updateEmployeeDistrictRec(c *gin.Context) {
	employeeID := c.Param("id")
	id, err := strconv.Atoi(employeeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}
	
	// Check if the employee exists
	_, err = app.repo.GetEmployeeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}
	
	// Parse request body
	var req struct {
		DistrictRecommendation float64 `json:"district_recommendation" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Validate score (between 0 and 100)
	if req.DistrictRecommendation < 0 || req.DistrictRecommendation > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "District recommendation score must be between 0 and 100"})
		return
	}
	
	// Update the district recommendation score
	err = app.repo.UpdateEmployeeDistrictRecommendation(id, req.DistrictRecommendation)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update district recommendation"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "District recommendation updated successfully"})
}

// Get employee promotion evaluation details
func (app *Application) getEmployeeEvaluation(c *gin.Context) {
	employeeID := c.Param("id")
	id, err := strconv.Atoi(employeeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}
	
	// Get the employee with all evaluation scores
	employee, err := app.repo.GetEmployeeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}
	
	// Format the response with just the evaluation fields, safely handling nullable fields
	evaluationDetails := gin.H{
		"employee_id":        employee.ID,
		"employee_name":      employee.FullName,
	}
	
	// Handle nullable fields
	if employee.IndividualPMS.Valid {
		evaluationDetails["individual_pms"] = employee.IndividualPMS.Float64
	} else {
		evaluationDetails["individual_pms"] = 0.0
	}
	
	if employee.Indpms25.Valid {
		evaluationDetails["indpms25"] = employee.Indpms25.Float64
	} else {
		evaluationDetails["indpms25"] = 0.0
	}
	
	if employee.Totalexp.Valid {
		evaluationDetails["total_experience"] = employee.Totalexp.Int64
	} else {
		evaluationDetails["total_experience"] = 0
	}
	
	if employee.Totalexp20.Valid {
		evaluationDetails["totalexp20"] = employee.Totalexp20.Float64
	} else {
		evaluationDetails["totalexp20"] = 0.0
	}
	
	if employee.Tmdrec20.Valid {
		evaluationDetails["manager_rec"] = employee.Tmdrec20.Float64
	} else {
		evaluationDetails["manager_rec"] = 0.0
	}
	
	if employee.Disrect15.Valid {
		evaluationDetails["district_rec"] = employee.Disrect15.Float64
	} else {
		evaluationDetails["district_rec"] = 0.0
	}
	
	if employee.Total.Valid {
		evaluationDetails["total_score"] = employee.Total.Float64
	} else {
		evaluationDetails["total_score"] = 0.0
	}
	
	c.JSON(http.StatusOK, evaluationDetails)
}

// ===== District Manager Handlers =====

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

// Get all employees with minimal fields
func (app *Application) getAllEmployeesSimple(c *gin.Context) {
	fmt.Println("DEBUG: getAllEmployeesSimple handler called")
	
	// Use the full GetAllEmployees method to ensure complete data
	employees, err := app.repo.GetAllEmployees()
	if err != nil {
		fmt.Printf("DEBUG: Error getting employees: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve employees: %v", err)})
		return
	}

	// Convert SQL nullable fields to regular values before sending to frontend
	var response []gin.H
	for _, emp := range employees {
		// Create a map with only the necessary fields, converting nullable fields
		employeeData := gin.H{
			"id":               emp.ID,
			"file_number":      emp.FileNumber,
			"full_name":        emp.FullName,
			"sex":              emp.Sex,
			"job_grade":        emp.JobGrade,
			"district":         emp.District,
			"new_position":     emp.CurrentPosition,
		}
		
		// Handle nullable fields if any are included in the simple view
		if emp.IndividualPMS.Valid {
			employeeData["individual_pms"] = emp.IndividualPMS.Float64
		} else {
			employeeData["individual_pms"] = 0.0
		}
		
		if emp.Total.Valid {
			employeeData["total_score"] = emp.Total.Float64
		} else {
			employeeData["total_score"] = 0.0
		}
		
		response = append(response, employeeData)
	}

	fmt.Printf("DEBUG: Retrieved %d employees for simplified endpoint\n", len(employees))
	c.JSON(http.StatusOK, response)
}