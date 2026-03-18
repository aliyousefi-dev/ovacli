package api

import (
	"net/http"
	"strings"

	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"

	"github.com/gin-gonic/gin"
)

// QuickSearchRequest represents the structure of the incoming search suggestions request.
type QuickSearchRequest struct {
	Query string `json:"query"`
}

// RegisterQuickSearchRoutes adds the /search-suggestions endpoint to the router group.
func RegisterQuickSearchRoutes(rg *gin.RouterGroup, repoManager *repo.RepoManager) {
	rg.POST("/quick-search", quickSearch(repoManager))
}

// quickSearch handles POST /search-suggestions with a JSON body containing the search query.
func quickSearch(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req QuickSearchRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			apitypes.RespondError(c, http.StatusBadRequest, "Invalid JSON payload")
			return
		}

		// Trim whitespace from query
		query := strings.TrimSpace(req.Query)
		if query == "" {
			apitypes.RespondError(c, http.StatusBadRequest, "Search query cannot be empty")
			return
		}

		// Perform the search for suggestions (partial matches)
		suggestions, err := repoManager.QuickSearch(query)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to retrieve search suggestions")
			return
		}

		response := gin.H{
			"query":   query,
			"results": suggestions,
		}

		// Respond with search suggestions
		apitypes.RespondSuccess(c, http.StatusOK, response, "Search suggestions retrieved successfully")
	}
}
