package main

import (
	"github.com/gin-gonic/gin"
	"github.com/brehan/bank/cmd/middleware"
)
func (app *Application) routes() *gin.Engine {
    r := gin.Default()

    // Public routes
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "pong",
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

    // Job routes - admin only
    jobs := admin.Group("/jobs")
    jobs.POST("/", app.createJob)
    jobs.GET("/", app.getAllJobs)
    jobs.GET("/:id", app.getJobById)
    jobs.GET("/type/:type", app.getJobsByType)
    jobs.PUT("/:id", app.updateJob)
    jobs.DELETE("/:id", app.deleteJob)
    jobs.GET("/:id/applications", app.getApplicationsForJob)
    
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
    // Allow managers to update only individual PMS
    manager.PATCH("/employees/:id/pms", app.updateEmployeePMS)

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
    // Allow district managers to update only district recommendations for employees in their branch
    district.PATCH("/employees/:id/recommendation", app.updateEmployeeDistrictRec)

    // Public job application routes (no auth required)
    publicRoutes := r.Group("/api/public")
    publicRoutes.GET("/jobs", app.getAllJobs) // Anyone can view jobs
    publicRoutes.POST("/apply/internal", app.handleInternalJobApplication)
    publicRoutes.POST("/apply/external", app.handleExternalJobApplication)

    return r
}