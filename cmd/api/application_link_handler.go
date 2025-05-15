package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/brehan/bank/cmd/data"
	"github.com/brehan/bank/cmd/service"
)

// Add ApplicationLinkService to the Application struct
type ApplicationLinkHandler struct {
	linkService *service.ApplicationLinkService
}

// Generate application links (internal and external) for a job
func (app *Application) generateApplicationLinks(c *gin.Context) {
	jobID := c.Param("id")
	
	// Create application links
	internalLink, externalLink, err := app.applicationLinkService.GenerateApplicationLinks(jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Format links for response
	baseURL := "http://localhost:3000" // Change this to your actual frontend URL
	links, err := app.applicationLinkService.FormatApplicationLinksForResponse(internalLink, externalLink, baseURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Application links generated successfully",
		"links": links,
	})
}

// Get application links for a job
func (app *Application) getApplicationLinks(c *gin.Context) {
	jobID := c.Param("id")
	
	// Get links from database
	links, err := app.applicationLinkService.GetApplicationLinksByJob(jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, links)
}

// Handle secure application form access via token
func (app *Application) getSecureApplicationForm(c *gin.Context) {
	token := c.Param("token")
	
	// Validate the token
	link, err := app.applicationLinkService.ValidateApplicationLink(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Get the job details
	job, err := app.repo.GetJobById(link.JobID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"job": job,
		"application_type": link.Type,
	})
}

// Handle internal application submission via secure link
func (app *Application) handleSecureInternalApplication(c *gin.Context) {
	token := c.Param("token")
	
	// Validate the token
	link, err := app.applicationLinkService.ValidateApplicationLink(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Check if this is an internal application link
	if link.Type != "internal" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid application type"})
		return
	}

	var internalApp data.InternalEmployee
	if err := c.ShouldBindJSON(&internalApp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set the job ID from the link
	internalApp.Jobid = link.JobID

	// Process file upload if included
	file, err := c.FormFile("resume")
	if err == nil {
		// A file was uploaded
		dst := "static/resumes/" + token + "_" + file.Filename
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

	// Mark the link as used
	if err := app.applicationLinkService.MarkLinkAsUsed(token); err != nil {
		app.log.Printf("Failed to mark link as used: %v", err)
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Internal job application submitted successfully"})
}

// Handle external application submission via secure link
func (app *Application) handleSecureExternalApplication(c *gin.Context) {
	token := c.Param("token")
	
	// Validate the token
	link, err := app.applicationLinkService.ValidateApplicationLink(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Check if this is an external application link
	if link.Type != "external" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid application type"})
		return
	}

	var externalApp data.ExternalEmployee
	if err := c.ShouldBindJSON(&externalApp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set the job ID from the link
	externalApp.Jobid = link.JobID

	// Process file upload if included
	file, err := c.FormFile("resume")
	if err == nil {
		// A file was uploaded
		dst := "static/resumes/" + token + "_" + file.Filename
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

	// Mark the link as used
	if err := app.applicationLinkService.MarkLinkAsUsed(token); err != nil {
		app.log.Printf("Failed to mark link as used: %v", err)
	}

	c.JSON(http.StatusCreated, gin.H{"message": "External job application submitted successfully"})
} 