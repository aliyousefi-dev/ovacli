// video.go
package api

import (
	"net/http"

	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"

	"github.com/gin-gonic/gin"
)

// RegisterVideoRoutes adds video-related endpoints including folder listing.
func RegisterVideoRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	videos := rg.Group("/videos")
	{
		videos.GET("/:videoId", getVideoByID(repoMgr)) // GET /api/v1/videos/{videoId}
		videos.GET("/:videoId/similar", getSimilarVideos(repoMgr))
	}
}

// getVideoByID returns details of a single video by ID.
func getVideoByID(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		// Retrieve the video by ID
		video, err := repoMgr.GetVideoByID(videoId)
		if err != nil {
			apitypes.RespondError(c, http.StatusNotFound, "Video not found")
			return
		}

		// Retrieve user data by OwnerAccountId
		userdata, err := repoMgr.GetUserByAccountID(video.UploaderID)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to retrieve user data")
			return
		}

		video_stats := apitypes.VideoStats{
			Views:     video.TotalViews,
			Downloads: video.TotalDownloads,
		}

		response := gin.H{
			"videoId":    video.VideoID,
			"title":      video.Title,
			"tags":       video.Tags,
			"uploadedAt": video.UploadedAt,
			"stats":      video_stats,
			"codecs":     video.Codecs,
			"isCooked":   video.IsCooked,
			"uploaderId": userdata.Username,
			"isPublic":   video.IsPublic,
		}

		// Respond with the converted video data
		apitypes.RespondSuccess(c, http.StatusOK, response, "Video retrieved successfully")
	}
}

func getSimilarVideos(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		similarVideos, err := repoMgr.GetSimilarVideos(videoId)
		if err != nil {
			apitypes.RespondError(c, http.StatusNotFound, "Video not found or no similar videos")
			return
		}

		// Limit to 8 items
		if len(similarVideos) > 8 {
			similarVideos = similarVideos[:8]
		}

		response := gin.H{
			"similarVideos": similarVideos,
		}

		apitypes.RespondSuccess(c, http.StatusOK, response, "Similar videos retrieved successfully")
	}
}
