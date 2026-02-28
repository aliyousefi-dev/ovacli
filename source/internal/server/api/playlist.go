package api

import (
	"net/http"
	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"

	"github.com/gin-gonic/gin"
)

// RegisterUserPlaylistRoutes registers playlist routes under the user scope.
func RegisterUserPlaylistRoutes(rg *gin.RouterGroup, rm *repo.RepoManager) {
	users := rg.Group("/me")
	{
		users.GET("/playlists", GetPlaylistsByUser(rm))
		users.POST("/playlists", CreatePlaylist(rm))
	}
}

// GET /me/playlists
func GetPlaylistsByUser(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		playlists, err := rm.GetPlaylistsByUser(accountID.(string))
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to retrieve playlists")
			return
		}

		type PlaylistResponse struct {
			ID          string `json:"id"`
			Title       string `json:"title"`
			Description string `json:"description"`
			CoverImage  string `json:"coverImageUrl"`
			Order       int    `json:"order"`
			VideoCount  int    `json:"videoCount"`
		}

		resp := make([]PlaylistResponse, 0, len(playlists))
		for _, pl := range playlists {

			count := len(pl.VideoIDs)
			var coverImage string
			if count > 0 {
				coverImage = pl.VideoIDs[0]
			} else {
				coverImage = ""
			}

			resp = append(resp, PlaylistResponse{
				ID:          pl.ID,
				Title:       pl.Title,
				CoverImage:  coverImage,
				Description: pl.Description,
				Order:       pl.Order,
				VideoCount:  count,
			})
		}

		apitypes.RespondSuccess(c, http.StatusOK, gin.H{
			"playlists":      resp,
			"totalPlaylists": len(resp),
		}, "Playlists retrieved successfully")
	}
}

// POST /me/playlists
func CreatePlaylist(rm *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		accountID, exists := c.Get("accountId")
		if !exists {
			apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
			return
		}

		var body struct {
			Title       string `json:"title" binding:"required"`
			Description string `json:"description"`
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			apitypes.RespondError(c, http.StatusBadRequest, "Title is required")
			return
		}

		// Create the playlist via Repo (this generates the NanoID and Order)
		newPl, err := rm.CreatePlaylist(accountID.(string), body.Title, body.Description)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to create playlist")
			return
		}

		// Return the FULL generated object (including ID and Order)
		apitypes.RespondSuccess(c, http.StatusCreated, newPl, "Playlist created successfully")
	}
}
