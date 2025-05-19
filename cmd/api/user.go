package main

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)
func (app *Application) Getallusers(c *gin.Context){
	users, err := app.authService.Getallusers()
	if err != nil {
		app.log.Printf("Error fetching users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	if users == nil {
		// Return empty array instead of null if no users found
		c.JSON(http.StatusOK, []map[string]interface{}{})
		return
	}
	
	c.JSON(http.StatusOK, users)
}

// deleteUser handles the DELETE /api/admin/users/:id endpoint
func (app *Application) deleteUser(c *gin.Context) {
	// Parse the user ID from the URL
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Check if the user exists first
	_, _, _, err = app.authService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Delete the user
	err = app.authRepo.DeleteUser(userID)
	if err != nil {
		app.log.Printf("Error deleting user %s: %v", userID.String(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
} 