package api

import (
	"net/http"
	"time"

	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"

	"github.com/gin-gonic/gin"
)

// RegisterAuthRoutes sets up the /auth routes with session and repo manager.
func RegisterProfileRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	auth := rg.Group("/profile")
	{
		auth.GET("/info", func(c *gin.Context) { profileHandler(c, repoMgr) })
	}
}

func profileHandler(c *gin.Context, repoMgr *repo.RepoManager) {
	// Retrieve accountId set by the AuthMiddleware
	accountID, exists := c.Get("accountId")
	if !exists {
		apitypes.RespondError(c, http.StatusUnauthorized, "Account ID not found")
		return
	}

	user, err := repoMgr.GetUserByAccountID(accountID.(string))
	if err != nil {
		apitypes.RespondError(c, http.StatusNotFound, "User not found")
		return
	}

	// Create a struct to hold the selected fields
	type UserProfile struct {
		DisplayName string    `json:"displayName"`
		AccountID   string    `json:"accountId"`
		Username    string    `json:"username"`
		CreatedAt   time.Time `json:"createdAt"`
	}

	// Populate the struct with the required fields
	profile := UserProfile{
		DisplayName: user.DisplayName,
		AccountID:   user.AccountID,
		Username:    user.Username,
		CreatedAt:   user.CreatedAt,
	}

	// Return the selected fields as JSON
	c.JSON(http.StatusOK, profile)
}
