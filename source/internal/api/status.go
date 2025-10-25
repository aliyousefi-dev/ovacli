package api

import (
	"net/http"
	apitypes "ova-cli/source/internal/api-types"

	"github.com/gin-gonic/gin"
)

// RegisterStatusRoute sets up a basic status route to verify server availability.
func RegisterStatusRoute(rg *gin.RouterGroup) {
	rg.GET("/status", func(c *gin.Context) {
		apitypes.RespondSuccess(c, http.StatusOK, gin.H{
			"status": "ok",
		}, "Server is running")
	})
}
