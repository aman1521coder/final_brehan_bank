package main

import (
	"github.com/gin-gonic/gin"
	"github.com/brehan/bank/cmd/middleware"
	"time"
)
func (app *Application) routes() *gin.Engine {
    r := gin.Default()

    // Add CORS middleware to all routes
    r.Use(middleware.CorsMiddleware())

    // Public routes
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "pong",
            "version": "1.0.0",
            "status": "running",
            "time": time.Now().Format(time.RFC3339),
            "cors": "enabled",
            "headers": gin.H{
                "origin": c.Request.Header.Get("Origin"),
                "referer": c.Request.Header.Get("Referer"),
                "user-agent": c.Request.Header.Get("User-Agent"),
            },
        })
    })

    r.POST("/api/auth/login", app.authHandler.Login)
    r.POST("/api/auth/register", app.authHandler.Register)

    // Protected routes
    api := r.Group("/api")
    api.Use(middleware.AuthMiddleware)

    // Employee routes - read-only
    employees := api.Group("/employees")
    employees.GET("/", app.getAllEmployees)
    employees.GET("/:id", app.getEmployeeById)

    // Admin routes
    admin := api.Group("/admin")
    admin.Use(middleware.RequireRole("admin"))
    admin.GET("/dashboard", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Admin dashboard",
        })
    })
    // Admin can create and fully update employees
    admin.POST("/employees", app.createEmployee)
    admin.PUT("/employees/:id", app.updateEmployee)
    admin.GET("/employees",app.getAllEmployees)
    
    // Admin user management
    admin.DELETE("/users/:id", app.deleteUser)
    admin.GET("/users", app.Getallusers)

    // Job routes - admin only
    jobs := admin.Group("/jobs")
    jobs.POST("/", app.createJob)
    jobs.GET("/", app.getAllJobs)
    jobs.GET("/:id", app.getJobById)
    jobs.GET("/type/:type", app.getJobsByType)
    jobs.PUT("/:id", app.updateJob)
    jobs.DELETE("/:id", app.deleteJob)
    jobs.GET("/:id/applications", app.getApplicationsForJob)
    
    // Application links - admin only
    jobs.POST("/:id/application-links", app.generateApplicationLinks)
    jobs.GET("/:id/application-links", app.getApplicationLinks)
    
    // Application management - admin only
    admin.GET("/applications/internal", app.getAllInternalApplications)
    admin.GET("/applications/external", app.getAllExternalApplications)
    admin.GET("/applications/internal/:id", app.getInternalApplicationsByJob)
    admin.GET("/applications/external/:id", app.getExternalApplicationsByJob)
	

    // Manager routes
    manager := api.Group("/manager")
    manager.Use(middleware.RequireRole("manager"))
    manager.GET("/dashboard", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Manager dashboard",
        })
    })
    // Allow managers to update evaluations for employees
    manager.PATCH("/employees/:id/pms", app.updateEmployeePMS)
    manager.PATCH("/employees/:id/recommendation", app.updateEmployeeManagerRecommendation)
    manager.GET("/employees/:id/evaluation", app.getEmployeeEvaluation)

    // District manager routes
    district := api.Group("/district")
    district.Use(middleware.RequireRole("district_manager"))
    district.GET("/dashboard", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "District manager dashboard",
        })
    })
    // Get all employees for the district manager's branch (limited info)
    district.GET("/employees", app.getEmployeesForDistrictManager)
    // Get specific employee for district manager (limited info)
    district.GET("/employees/:id", app.getEmployeeForDistrictManager)
    // Allow district managers to update district recommendations
    district.PATCH("/employees/:id/recommendation", app.updateEmployeeDistrictRec)
    district.GET("/employees/:id/evaluation", app.getEmployeeEvaluation)

    // Public job application routes (no auth required)
    publicRoutes := r.Group("/api/public")
    publicRoutes.GET("/jobs", app.getAllJobs) // Anyone can view jobs
    publicRoutes.POST("/apply/internal", app.handleInternalJobApplication)
    publicRoutes.POST("/apply/external", app.handleExternalJobApplication)

    // Secure application routes with tokens (no auth required)
    secureApplyRoutes := r.Group("/api/secure")
    secureApplyRoutes.GET("/apply/:token", app.getSecureApplicationForm)
    secureApplyRoutes.POST("/apply/internal/:token", app.handleSecureInternalApplication)
    secureApplyRoutes.POST("/apply/external/:token", app.handleSecureExternalApplication)

    return r
}