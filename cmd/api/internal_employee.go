package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/brehan/bank/cmd/data"
)

// Handle internal employee job application
func (app *Application) handleInternalJobApplication(c *gin.Context) {
	var internalApp data.InternalEmployee
	if err := c.ShouldBindJSON(&internalApp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Process file upload if included
	file, err := c.FormFile("resume")
	if err == nil {
		// A file was uploaded
		dst := "static/" + file.Filename
		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save resume"})
			return
		}
		internalApp.Resumepath = dst
	}

	// Save the application
	if err := app.internalEmployeeService.Save_Internal_Employee(internalApp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Match with employee record for automatic promotion
	emp, err := app.internalEmployeeService.MatchWithExistingEmployee(internalApp)
	if err == nil {
		// Successfully matched, can trigger promotion process
		app.log.Printf("Matched internal application from %s %s with employee ID %d", 
			internalApp.FirstName, internalApp.LastName, emp.ID)
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Internal job application submitted successfully"})
}

// Get all internal job applications
func (app *Application) getAllInternalApplications(c *gin.Context) {
	applications, err := app.internalEmployeeService.GetAllInternalApplications()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, applications)
}

// Get internal applications for a specific job
func (app *Application) getInternalApplicationsByJob(c *gin.Context) {
	jobID := c.Param("id")
	
	applications, err := app.internalEmployeeService.GetApplicationsByJobID(jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Match with existing employees for promotion tracking
	appCtx := app
	for i, application := range applications {
		emp, err := appCtx.internalEmployeeService.MatchWithExistingEmployee(application)
		if err == nil {
			applications[i].MatchedEmployee = emp.FullName
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"job_id": jobID,
		"applications": applications,
	})
}