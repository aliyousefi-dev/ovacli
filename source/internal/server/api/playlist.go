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

		// Use the clean Repo name
		playlists, err := rm.GetPlaylistsByUser(accountID.(string))
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to retrieve playlists")
			return
		}

		apitypes.RespondSuccess(c, http.StatusOK, gin.H{
			"playlists":      playlists,
			"totalPlaylists": len(playlists),
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

		// Use a simple binding struct for input
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
