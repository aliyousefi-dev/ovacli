package api

import (
	"net/http"
	"strconv"

	apitypes "ova-cli/source/internal/api-types"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// RegisterUserPlaylistContentRoutes registers playlist routes under the user scope.
func RegisterUserPlaylistContentRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {
	me := rg.Group("/me") // Change route to /me
	{
		me.GET("/playlists/:slug", getUserPlaylistContents(rm))                    // GET /api/v1/me/playlists/:slug
		me.POST("/playlists/:slug/videos", addVideoToPlaylist(rm))                 // POST /api/v1/me/playlists/:slug/videos
		me.DELETE("/playlists/:slug/videos/:videoId", deleteVideoFromPlaylist(rm)) // DELETE /api/v1/me/playlists/:slug/videos/:videoId
	}
}

// GET /me/playlists/:slug/contents
func getUserPlaylistContents(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Retrieve accountId set by the AuthMiddleware
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		slug := c.Param("slug")

		// Parse bucket from query parameters (default: 1)
		bucketStr := c.DefaultQuery("bucket", "1")
		bucket, err := strconv.Atoi(bucketStr)
		if err != nil || bucket <= 0 {
			apitypes.RespondError(c, http.StatusBadRequest, "Invalid bucket parameter")
			return
		}

		// Fixed bucket size
		bucketContentSize := 20

		// Get total number of videos in playlist
		totalVideos, err := rm.GetUserPlaylistContentVideosCount(accountID.(string), slug)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to get playlist videos count")
			return
		}

		// If playlist is empty
		if totalVideos == 0 {
			apitypes.RespondSuccess(c, http.StatusOK, gin.H{
				"slug":              slug,
				"videoIds":          []string{},
				"totalVideos":       0,
				"currentBucket":     bucket,
				"bucketContentSize": bucketContentSize,
				"totalBuckets":      0,
			}, "No videos found in playlist")
			return
		}

		// Calculate start/end based on bucket
		start := (bucket - 1) * bucketContentSize
		end := start + bucketContentSize
		if end > totalVideos {
			end = totalVideos
		}

		// Fetch playlist videos for the given bucket
		videos, err := rm.GetUserPlaylistContentVideosInRange(accountID.(string), slug, start, end)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to retrieve playlist videos")
			return
		}

		// Response payload
		response := gin.H{
			"slug":              slug,
			"videoIds":          videos,
			"totalVideos":       totalVideos,
			"currentBucket":     bucket,
			"bucketContentSize": bucketContentSize,
			"totalBuckets":      (totalVideos + bucketContentSize - 1) / bucketContentSize,
		}

		apitypes.RespondSuccess(c, http.StatusOK, response, "Playlist contents retrieved successfully")
	}
}

// POST /me/playlists/:slug/videos
func addVideoToPlaylist(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		slug := c.Param("slug")

		var body struct {
			VideoID string `json:"videoId"`
		}
		if err := c.ShouldBindJSON(&body); err != nil || body.VideoID == "" {
			apitypes.RespondError(c, http.StatusBadRequest, "Invalid or missing videoId")
			return
		}

		// Retrieve accountId set by the AuthMiddleware
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		err := rm.AddVideoToPlaylist(accountID.(string), slug, body.VideoID)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, err.Error())
			return
		}

		pl, _ := rm.GetUserPlaylist(accountID.(string), slug)
		apitypes.RespondSuccess(c, http.StatusOK, pl, "Video added to playlist")
	}
}

// DELETE /me/playlists/:slug/videos/:videoId
func deleteVideoFromPlaylist(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		slug := c.Param("slug")
		videoId := c.Param("videoId")

		// Retrieve accountId set by the AuthMiddleware
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		err := rm.RemoveVideoFromPlaylist(accountID.(string), slug, videoId)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, err.Error())
			return
		}

		pl, _ := rm.GetUserPlaylist(accountID.(string), slug)
		apitypes.RespondSuccess(c, http.StatusOK, pl, "Video removed from playlist")
	}
}
