package apitypes

import "github.com/gin-gonic/gin"

func RespondSuccess(c *gin.Context, status int, data interface{}, message string) {
	c.JSON(status, gin.H{
		"status":  "success",
		"data":    data,
		"message": message,
	})
}

func RespondError(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{
		"status": "error",
		"error": gin.H{
			"code":    status,
			"message": message,
		},
	})
}
