// video.go
package api

import (
	"net/http"
	"path/filepath"
	"strings"

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
		videos.GET("", getVideosByFolder(repoMgr)) // GET /api/v1/videos?folder=...
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
		userdata, err := repoMgr.GetUserByAccountID(video.OwnerAccountId)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to retrieve user data")
			return
		}

		fakeMarkers := []apitypes.MarkerDataRequest{
			{TimeSecond: 22, Label: "Introduction"},
			{TimeSecond: 60, Label: "Chapter 1: Start"},
			{TimeSecond: 2000, Label: "Conclusion"},
		}

		// Create the VideoDataAPIResponse from VideoData
		videoResponse := apitypes.VideoDataAPIResponse{
			VideoID:              video.VideoID,
			FileName:             video.GetFileName(),
			Tags:                 video.Tags,
			Codecs:               video.Codecs,
			Markers:              fakeMarkers,
			IsCooked:             video.IsCooked,
			OwnerAccountUsername: userdata.Username,
			TotalViews:           video.TotalViews,
			TotalDownloads:       video.TotalDownloads,
			IsPublic:             video.IsPublic,
			UploadedAt:           video.UploadedAt,
		}

		// Respond with the converted video data
		apitypes.RespondSuccess(c, http.StatusOK, videoResponse, "Video retrieved successfully")
	}
}

// getVideosByFolder returns a list of videos inside the given folder path.
func getVideosByFolder(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		folderQuery := c.Query("folder")
		requestedPath := filepath.ToSlash(strings.Trim(folderQuery, "/"))

		videosInFolder, err := repoMgr.GetIndxedVideosOnSpace(requestedPath)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to load videos")
			return
		}

		response := gin.H{
			"videos": videosInFolder,
		}

		apitypes.RespondSuccess(c, http.StatusOK, response, "Videos in folder retrieved")
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
