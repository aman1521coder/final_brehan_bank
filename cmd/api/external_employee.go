package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/brehan/bank/cmd/data"
)

// Handle external employee job application
func (app *Application) handleExternalJobApplication(c *gin.Context) {
	var externalApp data.ExternalEmployee
	if err := c.ShouldBindJSON(&externalApp); err != nil {
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
		externalApp.Resumepath = dst
	}

	// Save the application
	if err := app.externalEmployeeService.SaveExternalEmployee(externalApp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "External job application submitted successfully"})
}

// Get all external job applications
func (app *Application) getAllExternalApplications(c *gin.Context) {
	applications, err := app.externalEmployeeService.GetAllExternalApplications()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, applications)
}

// Get external applications for a specific job
func (app *Application) getExternalApplicationsByJob(c *gin.Context) {
	jobID := c.Param("id")
	
	applications, err := app.externalEmployeeService.GetApplicationsByJobID(jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"job_id": jobID,
		"applications": applications,
	})
} 