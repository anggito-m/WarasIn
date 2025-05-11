package middleware

import (
	"net/http"
	"strings"

	"warasin/pkg/auth"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware creates a middleware for authentication
func AuthMiddleware(jwtService auth.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   true,
				"message": "Authorization header is required",
			})
			c.Abort()
			return
		}

		// Check if the Authorization header has the correct format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   true,
				"message": "Invalid authorization format. Expected: Bearer {token}",
			})
			c.Abort()
			return
		}

		// Validate token
		claims, err := jwtService.ValidateToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   true,
				"message": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Set user data in context
		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("userType", claims.UserType)

		c.Next()
	}
}

// RequireUserType middleware to check if the user has the required user type
func RequireUserType(requiredType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userType, exists := c.Get("userType")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   true,
				"message": "User data not found",
			})
			c.Abort()
			return
		}

		if userType != requiredType {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   true,
				"message": "Access denied: required user type " + requiredType,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
