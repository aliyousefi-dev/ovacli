package api

import (
	"net/http"
	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RegisterLatestVideoRoute adds the latest video-related endpoint.
func RegisterLatestVideoRoute(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	videos := rg.Group("/videos")
	{
		videos.GET("/global", getGlobalVideos(repoMgr))
	}
}

// getGlobalVideos retrieves the latest video IDs based on the bucket provided in query params.
func getGlobalVideos(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse bucket from query parameters (default to 1 if not provided)
		pageParameterStr := c.DefaultQuery("page", "1")
		page, err := strconv.Atoi(pageParameterStr)
		if err != nil || page <= 0 {
			apitypes.RespondError(c, http.StatusBadRequest, "Invalid page parameter")
			return
		}
		maxPageSize := repoMgr.GetConfigs().MaxBucketSize

		sortParam := c.DefaultQuery("sort", "title_asc")
		sortMode := repo.SortMode(sortParam)

		videos, total, err := repoMgr.GetGlobalVideosPaginated(page, sortMode, maxPageSize)
		if err != nil || videos == nil {
			apitypes.RespondError(c, http.StatusNotFound, ErrVideoNotFound)
			return
		}

		// Prepare the response with video IDs and total video count
		response := gin.H{
			"videos":       videos,
			"currentPage ": page,
			"pageSize":     maxPageSize,
			"totalItems":   total,
			"totalPages":   (total + maxPageSize - 1) / maxPageSize,
			"hasNextPage":  (page*maxPageSize < total),
		}

		apitypes.RespondSuccess(c, http.StatusOK, response, "Latest videos retrieved successfully")
	}
}
