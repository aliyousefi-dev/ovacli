package api

import (
	"net/http"
	"ova-cli/source/internal/datatypes"
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

// getVideosByIds returns a batch of videos by IDs.
func getVideosByIds(repoMgr *repo.RepoManager) gin.HandlerFunc {
	type requestBody struct {
		IDs []string `json:"ids"`
	}

	return func(c *gin.Context) {
		var body requestBody
		if err := c.ShouldBindJSON(&body); err != nil {
			respondError(c, http.StatusBadRequest, "Invalid request")
			return
		}

		var matched []datatypes.VideoDataAPIResponse
		for _, id := range body.IDs {
			video, err := repoMgr.GetVideoByID(id)
			if err == nil && video != nil {

				userdata, err := repoMgr.GetUserByAccountID(video.OwnerAccountId)
				if err != nil {
					continue
				}

				// Create a new response struct with the modified fileName
				videoResponse := datatypes.VideoDataAPIResponse{
					VideoID:              video.VideoID,
					FileName:             video.GetFileName(),
					Tags:                 video.Tags,
					Codecs:               video.Codecs,
					IsCooked:             video.IsCooked,
					OwnerAccountUsername: userdata.Username,
					TotalViews:           video.TotalViews,
					TotalDownloads:       video.TotalDownloads,
					IsPublic:             video.IsPublic,
					UploadedAt:           video.UploadedAt,
				}

				// Append the modified video response to the matched slice
				matched = append(matched, videoResponse)
			}
		}

		respondSuccess(c, http.StatusOK, matched, "Videos retrieved successfully")
	}
}
