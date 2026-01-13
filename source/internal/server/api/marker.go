package api

import (
	"net/http"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"

	"github.com/gin-gonic/gin"
)

// RegisterMarkerRoutes sets up the API endpoints for marker management using RepoManager.
func RegisterMarkerRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {

	// fetch markers
	rg.GET("/videos/:videoId/markers", getMarkers(rm))

	// add markers
	rg.POST("/videos/:videoId/markers", addMarker(rm))

}

func getMarkers(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			apitypes.RespondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		markers, err := rm.GetMarkersByVideoID(videoId)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to fetch markers")
			return
		}

		apitypes.RespondSuccess(c, http.StatusOK, gin.H{
			"markers": markers,
		}, "Markers fetched successfully")
	}
}

func addMarker(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		//
		var body struct {
			TimeSecond  int    `json:"timeSecond"`
			Label       string `json:"label"`
			Description string `json:"description"`
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			apitypes.RespondError(c, http.StatusBadRequest, "Invalid JSON payload")
			return
		}

		// 3. Verify the video exists
		_, err := rm.GetVideoByID(videoId)
		if err != nil {
			// Note: If video is not found, 404 is usually better than 500
			apitypes.RespondError(c, http.StatusNotFound, ErrVideoNotFound)
			return
		}

		// 4. Pass the bound data to your repository
		rm.AddMarkerToVideo(videoId, datatypes.MarkerData{
			TimeSecond:  body.TimeSecond,
			Label:       body.Label,
			Description: body.Description,
		})

		apitypes.RespondSuccess(c, http.StatusCreated, nil, "Marker added successfully")
	}
}
