package api

import (
	"net/http"
	"strconv"
	"strings"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"

	"github.com/gin-gonic/gin"
)

// RegisterSearchRoutes adds the /search endpoint to the router group.
func RegisterSearchRoutes(rg *gin.RouterGroup, repoManager *repo.RepoManager) {
	rg.GET("/search", searchVideos(repoManager))
}

// searchVideos handles GET /search with query parameters: q, tags, and optional bucket.
func searchVideos(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse query parameters
		query := strings.TrimSpace(c.DefaultQuery("q", ""))
		tagsParam := c.DefaultQuery("tags", "")
		var tags []string
		if tagsParam != "" {
			// Comma-separated tags
			tags = strings.Split(tagsParam, ",")
			for i := range tags {
				tags[i] = strings.TrimSpace(tags[i])
			}
		}

		// Validate that at least one filter is provided
		if query == "" && len(tags) == 0 {
			apitypes.RespondError(c, http.StatusBadRequest, "At least one search criteria must be provided (q, tags)")
			return
		}

		// Get pagination params
		currentPage := 0
		pageSize := repoManager.GetConfigs().MaxBucketSize
		if page, ok := c.GetQuery("page"); ok {
			currentPageParam, err := strconv.Atoi(page)
			if err != nil {
				apitypes.RespondError(c, http.StatusBadRequest, "Invalid page parameter")
				return
			}
			currentPage = currentPageParam
		}

		criteria := datatypes.VideoSearchCriteria{
			Query: query,
			Tags:  tags,
		}

		result, err := repoManager.SearchVideosWithBuckets(criteria, currentPage, pageSize)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, err.Error())
			return
		}

		videos, err := repoManager.GetVideosByIDs(result.VideoIDs)
		if err != nil || videos == nil {
			// Handle error retrieving video
			apitypes.RespondError(c, http.StatusNotFound, ErrVideoNotFound)
			return
		}

		// Construct response (matches SearchResponse as before)
		response := gin.H{
			"videos":       videos,
			"currentPage ": currentPage,
			"pageSize":     pageSize,
			"totalItems":   result.TotalVideos,
			"totalPages":   (result.TotalVideos + pageSize - 1) / pageSize,
			"hasNextPage":  (currentPage+1)*pageSize < result.TotalVideos,
		}

		apitypes.RespondSuccess(c, http.StatusOK, response, "Search completed successfully")
	}
}
