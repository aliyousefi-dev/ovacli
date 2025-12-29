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
	rg.POST("/search", searchVideos(repoManager))
}

// searchVideos handles POST /search with a JSON body containing search criteria.
func searchVideos(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req apitypes.SearchRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			apitypes.RespondError(c, http.StatusBadRequest, "Invalid JSON payload")
			return
		}

		criteria := datatypes.VideoSearchCriteria{
			Query:       strings.TrimSpace(req.Query),
			Tags:        req.Tags,
			MinRating:   req.MinRating,
			MaxDuration: req.MaxDuration,
		}

		// Validate that at least one filter is provided
		if criteria.Query == "" && len(criteria.Tags) == 0 && criteria.MinRating == 0 && criteria.MaxDuration == 0 {
			apitypes.RespondError(c, http.StatusBadRequest, "At least one search criteria must be provided (query, tags, minRating, or maxDuration)")
			return
		}

		// Get pagination params
		currentBucket := 0
		bucketSize := repoManager.GetConfigs().MaxBucketSize
		if bucket, ok := c.GetQuery("bucket"); ok {
			currentBucketParam, err := strconv.Atoi(bucket)
			if err != nil {
				apitypes.RespondError(c, http.StatusBadRequest, "Invalid bucket parameter")
				return
			}
			currentBucket = currentBucketParam
		}

		// Search with pagination (bucket logic)
		// result is now the BucketSearchResult struct we defined
		result, err := repoManager.SearchVideosWithBuckets(criteria, currentBucket, bucketSize)
		if err != nil {
			// Handle the "out of range" error specifically if you want a 400 instead of 500
			apitypes.RespondError(c, http.StatusInternalServerError, err.Error())
			return
		}

		// Create the response
		// Note: We use the result struct directly or map its fields.
		response := apitypes.SearchResponse{
			Criteria: apitypes.SearchCriteria{
				Query: req.Query,
				Tags:  req.Tags,
			},
			Result: apitypes.VideoBucketResponse{
				VideoIDs:          result.VideoIDs,
				TotalVideos:       result.TotalVideos,
				CurrentBucket:     result.CurrentBucket,
				BucketContentSize: bucketSize,
				TotalBuckets:      result.TotalBuckets,
			},
		}

		apitypes.RespondSuccess(c, http.StatusOK, response, "Search completed successfully")
	}
}
