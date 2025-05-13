package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/brehan/bank/cmd/data"
)

// Create a new job posting
func (app *Application) createJob(c *gin.Context) {
	var job data.Job
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Save the job
	if err := app.repo.CreateJob(job); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Job created successfully", "job_id": job.ID})
}

// Get all job postings
func (app *Application) getAllJobs(c *gin.Context) {
	// For now, just return a simple message as this needs repository implementation
	c.JSON(http.StatusOK, gin.H{"message": "Get all jobs endpoint"})
}

// Get job by ID
func (app *Application) getJobById(c *gin.Context) {
	jobID := c.Param("id")
	
	// Convert string ID to integer
	id, err := strconv.Atoi(jobID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}
	
	// Get job details
	job, err := app.repo.GetJobById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	c.JSON(http.StatusOK, job)
}

// Get job by type (internal/external)
func (app *Application) getJobsByType(c *gin.Context) {
	jobType := c.Param("type")
	
	// Get jobs by type
	jobs, err := app.repo.GetJobByType(jobType)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No jobs found for this type"})
		return
	}

	c.JSON(http.StatusOK, jobs)
}

// Update job
func (app *Application) updateJob(c *gin.Context) {
	jobID := c.Param("id")
	
	// Convert string ID to integer
	id, err := strconv.Atoi(jobID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}

	var job data.Job
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ensure ID matches
	job.ID = id

	// TODO: Implement job update in repository

	c.JSON(http.StatusOK, gin.H{"message": "Job updated successfully"})
}

// Delete job
func (app *Application) deleteJob(c *gin.Context) {

	// TODO: Implement job deletion in repository

	c.JSON(http.StatusOK, gin.H{"message": "Job deleted successfully"})
}

// Get applications for a specific job
func (app *Application) getApplicationsForJob(c *gin.Context) {
	jobID := c.Param("id")
	
	// Get internal applications
	internalApps, err1 := app.internalEmployeeService.GetApplicationsByJobID(jobID)
	
	// Get external applications
	externalApps, err2 := app.externalEmployeeService.GetApplicationsByJobID(jobID)
	
	if err1 != nil && err2 != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve applications"})
		return
	}

	// For internal applications, check if they match existing employees
	appCtx := app
	for i, application := range internalApps {
		emp, err := appCtx.internalEmployeeService.MatchWithExistingEmployee(application)
		if err == nil {
			internalApps[i].MatchedEmployee = emp.FullName
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"job_id": jobID,
		"internal_applications": internalApps,
		"external_applications": externalApps,
	})
}