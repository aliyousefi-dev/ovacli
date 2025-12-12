package api

import (
	"net/http"
	"strconv"

	apitypes "ova-cli/source/internal/api-types"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

func RegisterUserSavedRoutes(rg *gin.RouterGroup, repoManager *repo.RepoManager) {
	me := rg.Group("/me") // Change route to /me
	{
		me.GET("/saved", getUserSaved(repoManager))                // GET /api/v1/me/saved
		me.POST("/saved/:videoId", addUserSaved(repoManager))      // POST /api/v1/me/saved/:videoId
		me.DELETE("/saved/:videoId", removeUserSaved(repoManager)) // DELETE /api/v1/me/saved/:videoId
	}
}

// GET /me/saved
func getUserSaved(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Retrieve accountId set by the AuthMiddleware
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		// Parse bucket from query parameters (default to 1 if not provided)
		bucketStr := c.DefaultQuery("bucket", "1")

		// Convert bucket to integer
		bucket, err := strconv.Atoi(bucketStr)
		if err != nil || bucket <= 0 {
			apitypes.RespondError(c, http.StatusBadRequest, "Invalid bucket parameter")
			return
		}

		// Hardcode the bucket size to 20
		bucketContentSize := repoManager.GetConfigs().MaxBucketSize

		// Call GetUserSavedVideos to get the total count of saved videos for the user
		totalVideos, err := repoManager.GetUserSavedVideosCount(accountID.(string))
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to get saved videos count")
			return
		}

		// If there are no saved videos, return an empty response
		if totalVideos == 0 {
			apitypes.RespondSuccess(c, http.StatusOK, gin.H{
				"videoIds":          []string{}, // Empty array for saved videos
				"totalVideos":       0,
				"currentBucket":     bucket,
				"bucketContentSize": bucketContentSize,
				"totalBuckets":      0, // No buckets if no videos
			}, "No saved videos found")
			return
		}

		// Calculate the start and end indices based on bucket and hardcoded bucket_size (20)
		start := (bucket - 1) * bucketContentSize
		end := start + bucketContentSize

		// Ensure the end index does not exceed the total number of saved videos
		if end > totalVideos {
			end = totalVideos
		}

		// Fetch saved video IDs in the calculated range from memory storage
		savedVideos, err := repoManager.GetUserSavedVideosInRange(accountID.(string), start, end)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to retrieve saved videos in range")
			return
		}

		// Prepare the response with saved video IDs, total video count, and bucket details
		response := gin.H{
			"videoIds":          savedVideos,
			"totalVideos":       totalVideos,
			"currentBucket":     bucket,
			"bucketContentSize": bucketContentSize,
			"totalBuckets":      (totalVideos + bucketContentSize - 1) / bucketContentSize, // Calculate total number of buckets
		}

		apitypes.RespondSuccess(c, http.StatusOK, response, "Saved videos retrieved successfully")
	}
}

// POST /me/saved/:videoId
func addUserSaved(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoID := c.Param("videoId")

		// Retrieve accountId set by the AuthMiddleware
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		// Check video existence via RepoManager
		if _, err := repoManager.GetVideoByID(videoID); err != nil {
			apitypes.RespondError(c, http.StatusNotFound, "Video not found")
			return
		}

		if err := repoManager.AddVideoToSaved(accountID.(string), videoID); err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to add saved video: "+err.Error())
			return
		}

		apitypes.RespondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoID,
		}, "Video added to saved")
	}
}

// DELETE /me/saved/:videoId
func removeUserSaved(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoID := c.Param("videoId")

		// Retrieve accountId set by the AuthMiddleware
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		if err := repoManager.RemoveVideoFromSaved(accountID.(string), videoID); err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to remove saved video: "+err.Error())
			return
		}

		apitypes.RespondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoID,
		}, "Video removed from saved")
	}
}
