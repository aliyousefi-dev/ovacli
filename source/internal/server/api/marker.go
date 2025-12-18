package api

import (
	"fmt"
	"net/http"

	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"

	"github.com/gin-gonic/gin"
)

// RegisterMarkerRoutes sets up the API endpoints for marker management using RepoManager.
func RegisterMarkerRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {

	rg.GET("/videos/:videoId/markers", getMarkers(rm))
	rg.POST("/videos/:videoId/markers", addMarker(rm))

}

func getMarkers(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")
		if videoId == "" {
			apitypes.RespondError(c, http.StatusBadRequest, "videoId parameter is required")
			return
		}

		markersForResponse, err := rm.GetMarkersForVideo(videoId)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to get markers: "+err.Error())
			return
		}

		apitypes.RespondSuccess(c, http.StatusOK, gin.H{
			"videoId": videoId,
			"markers": markersForResponse,
		}, "Markers fetched successfully")
	}
}

func addMarker(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// videoId := c.Param("videoId")
		var markerData apitypes.MarkerData

		markerData.Title = "New Marker"
		markerData.Description = "Description"
		markerData.TimeSecond = 0

		apitypes.RespondSuccess(c, http.StatusOK, nil, "Marker added successfully"+markerData.Title+markerData.Description+fmt.Sprint(markerData.TimeSecond))
	}
}
