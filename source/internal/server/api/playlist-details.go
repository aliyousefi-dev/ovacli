package api

import (
	"net/http"
	"strconv"

	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"

	"github.com/gin-gonic/gin"
)

// RegisterUserPlaylistContentRoutes registers playlist routes under the user scope.
func RegisterUserPlaylistContentRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {
	me := rg.Group("/me")
	{
		me.GET("/playlists/:playlistId", GetPlaylistVideos(rm))          // Get Playlist Videos Content
		me.POST("/playlists/:playlistId/videos", AddVideoToPlaylist(rm)) // ad multi videos to a playlist
	}
}

// GET /me/playlists/:playlistId/videos
func GetPlaylistVideos(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		playlistId := c.Param("playlistId")

		// 1. Setup Pagination Defaults
		currentPage := 1
		pageSize := rm.GetConfigs().MaxBucketSize

		// 2. Parse Query Params
		if pageStr := c.Query("page"); pageStr != "" {
			if val, err := strconv.Atoi(pageStr); err == nil && val > 0 {
				currentPage = val
			}
		}

		// Optional: Let user define limit, but cap it at MaxBucketSize
		if limitStr := c.Query("limit"); limitStr != "" {
			if val, err := strconv.Atoi(limitStr); err == nil && val > 0 && val <= pageSize {
				pageSize = val
			}
		}

		// 3. Fetch data (Notice we pass currentPage and pageSize now!)
		videos, total, err := rm.GetPlaylistVideoIDsPaginated(accountID.(string), playlistId, currentPage, pageSize)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to retrieve playlist videos")
			return
		}

		// 4. Construct response
		response := gin.H{
			"videos":      videos,
			"currentPage": currentPage, // Fixed trailing space
			"pageSize":    pageSize,
			"totalItems":  total,
			"totalPages":  (total + pageSize - 1) / pageSize,
			"hasNextPage": (currentPage*pageSize < total),
		}

		apitypes.RespondSuccess(c, http.StatusOK, response, "Playlist videos retrieved successfully")
	}
}

func AddVideoToPlaylist(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get User Context
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		playlistId := c.Param("playlistId")

		// 2. Parse Request Body
		var body struct {
			VideoID string `json:"videoId" binding:"required"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			apitypes.RespondError(c, http.StatusBadRequest, "A valid videoId is required")
			return
		}

		err := rm.AddVideoToPlaylist(accountID.(string), playlistId, body.VideoID)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to add video to playlist")
			return
		}

		updatedPl, err := rm.GetPlaylistByID(accountID.(string), playlistId)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to get updated playlist")
			return
		}

		type PlaylistResponse struct {
			ID          string `json:"id"`
			Title       string `json:"title"`
			Description string `json:"description"`
			CoverImage  string `json:"coverImageUrl"`
			VideoCount  int    `json:"videoCount"`
		}

		resp := PlaylistResponse{
			ID:          updatedPl.ID,
			Title:       updatedPl.Title,
			Description: updatedPl.Description,
			VideoCount:  len(updatedPl.VideoIDs),
		}

		if len(updatedPl.VideoIDs) > 0 {
			resp.CoverImage = updatedPl.VideoIDs[0]
		} else {
			resp.CoverImage = ""
		}

		apitypes.RespondSuccess(c, http.StatusOK, resp, "Video added to playlist")
	}
}
