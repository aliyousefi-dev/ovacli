package api

import (
	"net/http"

	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"

	"github.com/gin-gonic/gin"
)

// RegisterMarkerRoutes sets up the API endpoints for marker management using RepoManager.
func RegisterRepoRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {

	// fetch markers
	rg.GET("/repo/info", getInfo(rm))

}

func getInfo(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {

		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		info, err := rm.GetRepoInfo(accountID.(string))
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to get info")
			return
		}

		response := gin.H{
			"info": info,
		}

		apitypes.RespondSuccess(c, http.StatusOK, response, "Markers fetched successfully")
	}
}
