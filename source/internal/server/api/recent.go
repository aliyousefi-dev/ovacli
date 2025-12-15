package api

import (
	"net/http"
	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RegisterUserWatchedRoutes adds watched video endpoints for users.
func RegisterUserWatchedRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	me := rg.Group("/me")
	{
		me.POST("/recent", addVideoToWatched(repoMgr))         // POST /api/v1/me/recent
		me.GET("/recent", getUserWatchedVideos(repoMgr))       // GET /api/v1/me/recent
		me.DELETE("/recent", clearUserWatchedHistory(repoMgr)) // DELETE /api/v1/me/recent
	}
}

func addVideoToWatched(r *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Retrieve accountId set by the AuthMiddleware
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		var req struct {
			VideoID string `json:"videoId"`
		}
		if err := c.ShouldBindJSON(&req); err != nil || req.VideoID == "" {
			apitypes.RespondError(c, http.StatusBadRequest, "Invalid videoId in request")
			return
		}

		err := r.AddVideoToWatched(accountID.(string), req.VideoID)
		if err != nil {
			apitypes.RespondError(c, http.StatusBadRequest, err.Error())
			return
		}

		apitypes.RespondSuccess(c, http.StatusOK, nil, "Video marked as watched")
	}
}

func getUserWatchedVideos(r *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Retrieve accountId set by the AuthMiddleware
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		// Parse the bucket from query parameters (default to 1 if not provided)
		bucketStr := c.DefaultQuery("bucket", "1")
		bucket, err := strconv.Atoi(bucketStr)
		if err != nil || bucket <= 0 {
			apitypes.RespondError(c, http.StatusBadRequest, "Invalid bucket parameter")
			return
		}

		// Hardcode the bucket size to 20 (or any other appropriate size)
		bucketContentSize := r.GetConfigs().MaxBucketSize

		// Get the count of watched videos for the user
		totalVideos, err := r.GetUserWatchedVideosCount(accountID.(string))
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to get watched video count")
			return
		}

		// If no videos are found, return an empty list
		if totalVideos == 0 {
			response := apitypes.VideoBucketResponse{
				VideoIDs:          []string{}, // Return an empty videoIds array
				TotalVideos:       0,
				CurrentBucket:     bucket,
				BucketContentSize: bucketContentSize,
				TotalBuckets:      0, // No buckets if there are no videos
			}
			apitypes.RespondSuccess(c, http.StatusOK, response, "No watched videos found")
			return
		}

		// Calculate the start and end indices based on the bucket and bucket size
		start := (bucket - 1) * bucketContentSize
		end := start + bucketContentSize

		// Ensure the end index does not exceed the total number of videos
		if end > totalVideos {
			end = totalVideos
		}

		// Fetch the specific range of watched videos
		videosInRange, err := r.GetUserWatchedVideosInRange(accountID.(string), start, end)
		if err != nil {
			apitypes.RespondError(c, http.StatusBadRequest, err.Error())
			return
		}

		// If no videos in the range, return an empty videoIds list
		if len(videosInRange) == 0 {
			videosInRange = []string{}
		}

		// Prepare the response with the videos in the current bucket, total count, and number of buckets
		response := apitypes.VideoBucketResponse{
			VideoIDs:          videosInRange,
			TotalVideos:       totalVideos,
			CurrentBucket:     bucket,
			BucketContentSize: bucketContentSize,
			TotalBuckets:      (totalVideos + bucketContentSize - 1) / bucketContentSize,
		}

		apitypes.RespondSuccess(c, http.StatusOK, response, "Fetched watched videos")
	}
}

func clearUserWatchedHistory(r *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Retrieve accountId set by the AuthMiddleware
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		err := r.ClearUserWatchedHistory(accountID.(string))
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to clear watched history: "+err.Error())
			return
		}

		apitypes.RespondSuccess(c, http.StatusOK, nil, "User watched history cleared successfully")
	}
}
