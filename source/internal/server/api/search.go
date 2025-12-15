package api

import (
	"net/http"
	"strconv"
	"strings"

	"ova-cli/source/internal/datastorage/datatypes"
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
		bucketSize := repoManager.GetConfigs().MaxBucketSize // Adjust to your preferred bucket size
		if bucket, ok := c.GetQuery("bucket"); ok {
			// Parse and handle the bucket pagination if provided in the request query
			currentBucketParam, err := strconv.Atoi(bucket)
			if err != nil {
				apitypes.RespondError(c, http.StatusBadRequest, "Invalid bucket parameter")
				return
			}
			currentBucket = currentBucketParam
		}

		// Search with pagination (bucket logic)
		results, err := repoManager.SearchVideosWithBuckets(criteria, currentBucket, bucketSize)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to search videos")
			return
		}

		// Calculate total buckets
		totalVideos := len(results) // Assuming `results` contains video IDs
		totalBuckets := (totalVideos + bucketSize - 1) / bucketSize

		// Create the response with pagination
		response := apitypes.SearchResponse{
			Criteria: apitypes.SearchCriteria{
				Query: req.Query,
				Tags:  req.Tags,
			},
			Result: apitypes.VideoBucketResponse{
				VideoIDs:          results, // Video IDs only
				TotalVideos:       totalVideos,
				CurrentBucket:     currentBucket,
				BucketContentSize: bucketSize,
				TotalBuckets:      totalBuckets,
			},
		}
		// Respond with the paginated search result
		apitypes.RespondSuccess(c, http.StatusOK, response, "Search completed successfully")
	}
}
