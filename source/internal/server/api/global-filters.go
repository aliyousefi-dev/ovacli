package api

import (
	"net/http"
	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"

	"github.com/gin-gonic/gin"
)

// RegisterGlobalFiltersRoute adds the global filters-related endpoint.
func RegisterGlobalFiltersRoute(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	videos := rg.Group("/videos")
	{
		// GET /api/v1/videos/global/filters
		videos.GET("/global/filters", getGlobalFilters(repoMgr))
	}
}

// getGlobalFilters retrieves predefined filter presets for global use.
func getGlobalFilters(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {

		filters, err := repoMgr.GetGlobalFilters()
		if err != nil {
			apitypes.RespondError(c, http.StatusNotFound, "global filter error")
			return
		}

		// Respond with the filter presets
		apitypes.RespondSuccess(c, http.StatusOK, filters, "Filters retrieved successfully")
	}
}
