package api

import (
	"net/http"
	"os"

	apitypes "ova-cli/source/internal/api-types"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// RegisterThumbnailRoutes registers the thumbnail endpoint using the provided RepoManager.
func RegisterThumbnailRoutes(rg *gin.RouterGroup, repo *repo.RepoManager) {
	rg.GET("/thumbnail/:videoId", getThumbnail(repo))
}

// getThumbnail returns a handler function that serves a thumbnail image for a given video ID.
func getThumbnail(repo *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		videoId := c.Param("videoId")

		// Attempt to fetch the thumbnail path using GetThumbnailFilePathByVideoID
		thumbnailPath := repo.GetThumbnailFilePathByVideoID(videoId)

		// Check if the thumbnail file exists
		if _, err := os.Stat(thumbnailPath); os.IsNotExist(err) {
			apitypes.RespondError(c, http.StatusNotFound, "Thumbnail not found")
			return
		} else if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to access thumbnail file")
			return
		}

		// Serve the thumbnail file
		c.File(thumbnailPath)
	}
}
