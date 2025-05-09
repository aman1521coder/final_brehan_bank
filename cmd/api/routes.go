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

    // Admin routes
    admin := api.Group("/admin")
    admin.Use(middleware.RequireRole("admin"))
    admin.GET("/dashboard", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Admin dashboard",
        })
    })

    // Manager routes
    manager := api.Group("/manager")
    manager.Use(middleware.RequireRole("manager"))
    manager.GET("/dashboard", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Manager dashboard",
        })
    })

    // District manager routes
    district := api.Group("/district")
    district.Use(middleware.RequireRole("district_manager"))
    district.GET("/dashboard", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "District manager dashboard",
        })
    })

    return r
}