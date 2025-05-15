package middleware

import (
	"github.com/gin-gonic/gin"
)

// CorsMiddleware adds CORS headers to allow all cross-origin requests
// This is a simplified version for development
func CorsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get request origin
		origin := c.Request.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		
		// Allow the specific origin that made the request
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length, Content-Type, Authorization")
		

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	}
} 