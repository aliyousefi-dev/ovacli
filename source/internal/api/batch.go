package api

import (
	"fmt"
	"net/http"
	apitypes "ova-cli/source/internal/api-types"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// RegisterVideoRoutes adds video-related endpoints including folder listing.
func RegisterBatchRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	videos := rg.Group("/videos")
	{
		videos.POST("/batch", getVideosByIds(repoMgr)) // POST /api/v1/videos/batch
	}
}

func getVideosByIds(repoMgr *repo.RepoManager) gin.HandlerFunc {
	type requestBody struct {
		IDs []string `json:"ids"`
	}

	return func(c *gin.Context) {
		var body requestBody
		if err := c.ShouldBindJSON(&body); err != nil {
			apitypes.RespondError(c, http.StatusBadRequest, "Invalid request")
			return
		}

		// Retrieve accountId set by the AuthMiddleware
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		var matched []apitypes.VideoDataAPIResponse
		for _, id := range body.IDs {
			// Get the video by ID
			video, err := repoMgr.GetVideoByID(id)
			if err != nil || video == nil {
				// Handle error retrieving video
				apitypes.RespondError(c, http.StatusNotFound, fmt.Sprintf("Video with ID %s not found", id))
				return
			}

			// Get user data for the video owner
			userdata, err := repoMgr.GetUserByAccountID(video.OwnerAccountId)
			if err != nil || userdata == nil {
				// Skip if user data is not found
				continue
			}

			// Get user data for the video owner
			currentuser, err := repoMgr.GetUserByAccountID(accountID.(string))
			if err != nil || userdata == nil {
				// Skip if user data is not found
				continue
			}

			// Check if the video ID is in the Watched or Favorites arrays
			isWatched := contains(currentuser.Watched, video.VideoID)
			isSaved := contains(currentuser.Favorites, video.VideoID)

			// Define the video user status based on user data
			video_user_status := apitypes.UserVideoStatus{
				IsWatched: isWatched,
				IsSaved:   isSaved,
			}

			// Create the video response
			videoResponse := apitypes.VideoDataAPIResponse{
				VideoID:              video.VideoID,
				FileName:             video.GetFileName(),
				Tags:                 video.Tags,
				Codecs:               video.Codecs,
				IsCooked:             video.IsCooked,
				OwnerAccountUsername: userdata.Username,
				TotalViews:           video.TotalViews,
				TotalDownloads:       video.TotalDownloads,
				VideoStatus:          video_user_status,
				IsPublic:             video.IsPublic,
				UploadedAt:           video.UploadedAt,
			}

			// Append the response to the matched slice
			matched = append(matched, videoResponse)
		}

		// Return the response
		apitypes.RespondSuccess(c, http.StatusOK, matched, "Videos retrieved successfully")
	}
}

// Helper function to check if a video ID is in a list
func contains(arr []string, videoID string) bool {
	for _, v := range arr {
		if v == videoID {
			return true
		}
	}
	return false
}
