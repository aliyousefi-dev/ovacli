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

// searchVideos handles GET /search with query parameters: q, tags, marker, and optional bucket.
func searchVideos(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse query parameters
		query := strings.TrimSpace(c.DefaultQuery("q", ""))
		tagsParam := c.DefaultQuery("tags", "")
		marker := strings.TrimSpace(c.DefaultQuery("marker", ""))
		var tags []string
		if tagsParam != "" {
			// Comma-separated tags
			tags = strings.Split(tagsParam, ",")
			for i := range tags {
				tags[i] = strings.TrimSpace(tags[i])
			}
		}

		// Validate that at least one filter is provided
		if query == "" && len(tags) == 0 && marker == "" {
			apitypes.RespondError(c, http.StatusBadRequest, "At least one search criteria must be provided (q, tags, marker)")
			return
		}

		sortParam := c.DefaultQuery("sort", "title_asc")
		sortMode := repo.SortMode(sortParam)

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
			Query:  query,
			Tags:   tags,
			Marker: marker,
		}

		result, total, err := repoManager.SearchVideosPaginated(criteria, currentPage, pageSize, sortMode)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, err.Error())
			return
		}

		// Construct response (matches SearchResponse as before)
		response := gin.H{
			"videos":      result,
			"currentPage": currentPage,
			"pageSize":    pageSize,
			"totalItems":  total,
			"totalPages":  (total + pageSize - 1) / pageSize,
			"hasNextPage": (currentPage+1)*pageSize < total,
		}

		apitypes.RespondSuccess(c, http.StatusOK, response, "Search completed successfully")
	}
}
