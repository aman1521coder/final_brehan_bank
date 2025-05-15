package main

import (
	"net/http"

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
	// Use the repository's GetAllJobs function instead of direct SQL
	jobs, err := app.repo.GetAllJobs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, jobs)
}

// Get job by ID
func (app *Application) getJobById(c *gin.Context) {
	jobID := c.Param("id")
	
	// No need to convert string ID to integer
	// Get job details
	job, err := app.repo.GetJobById(jobID)
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
	
	var job data.Job
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ensure ID matches
	job.ID = jobID

	// Update the job
	if err := app.repo.UpdateJob(job); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Job updated successfully"})
}

// Delete job
func (app *Application) deleteJob(c *gin.Context) {
	jobID := c.Param("id")
	
	// Delete the job
	if err := app.repo.DeleteJob(jobID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Job deleted successfully"})
}

// Get applications for a specific job
func (app *Application) getApplicationsForJob(c *gin.Context) {
	jobID := c.Param("id")
	
	// Get internal applications
	internalApps, err1 := app.repo.GetInternalApplicationsByJobID(jobID)
	
	// Get external applications
	externalApps, err2 := app.repo.GetExternalApplicationsByJobID(jobID)
	
	if err1 != nil && err2 != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve applications"})
		return
	}

	// For internal applications, check if they match existing employees
	for i, application := range internalApps {
		// Create a full name to search for
		fullName := application.FirstName + " " + application.LastName
		
		// Try to find a matching employee
		employees, err := app.repo.GetEmployeesByName(fullName)
		if err == nil && len(employees) > 0 {
			internalApps[i].MatchedEmployee = employees[0].FullName
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"job_id": jobID,
		"internal_applications": internalApps,
		"external_applications": externalApps,
	})
}