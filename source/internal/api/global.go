package api

import (
	"fmt"
	"net/http"
	"ova-cli/source/internal/repo"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RegisterLatestVideoRoute adds the latest video-related endpoint.
func RegisterLatestVideoRoute(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	videos := rg.Group("/videos")
	{
		// GET /api/v1/videos/latest?bucket=1
		videos.GET("/global", getLatestVideos(repoMgr))
	}
}

// getLatestVideos retrieves the latest video IDs based on the bucket provided in query params.
func getLatestVideos(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse bucket from query parameters (default to 1 if not provided)
		bucketStr := c.DefaultQuery("bucket", "1")

		// Convert bucketBlockNumber to integer
		bucketBlockNumber, err := strconv.Atoi(bucketStr)
		if err != nil || bucketBlockNumber <= 0 {
			respondError(c, http.StatusBadRequest, "Invalid bucket parameter")
			return
		}

		// Hardcode the bucket size to 20
		maxBucketSize := repoMgr.GetConfigs().MaxBucketSize

		// Call GetTotalIndexedVideoCount to get the total count of cached videos
		totalVideos, err := repoMgr.GetTotalIndexedVideoCount()
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to get total video count")
			return
		}

		// Calculate the start and end indices based on bucket and hardcoded bucket_size (20)
		start := (bucketBlockNumber - 1) * maxBucketSize
		end := start + maxBucketSize

		fmt.Print("Start and end is ", start, " ", end)

		// Ensure the end index does not exceed the total number of videos
		if end > totalVideos {
			end = totalVideos
		}

		// Fetch video IDs in the calculated range from memory storage
		videoIDsInRange, err := repoMgr.GetGlobalVideosInRange(start, end)
		if err != nil {
			// Respond with a formatted error message
			respondError(c, http.StatusInternalServerError, fmt.Sprintf("Failed to retrieve videos: %v", err))
			return
		}

		// Prepare the response with video IDs and total video count
		response := gin.H{
			"videoIds":          videoIDsInRange,
			"totalVideos":       totalVideos, // Add total video count to the response
			"currentBucket":     bucketBlockNumber,
			"bucketContentSize": maxBucketSize,
			"totalBuckets":      (totalVideos + maxBucketSize - 1) / maxBucketSize, // Calculate total number of buckets
		}

		respondSuccess(c, http.StatusOK, response, "Latest videos retrieved successfully")
	}
}
