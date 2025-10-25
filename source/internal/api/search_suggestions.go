package api

import (
	"net/http"
	"strings"

	apitypes "ova-cli/source/internal/api-types"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
)

// SearchSuggestionsRequest represents the structure of the incoming search suggestions request.
type SearchSuggestionsRequest struct {
	Query string `json:"query"`
}

// RegisterSearchSuggestionsRoutes adds the /search-suggestions endpoint to the router group.
func RegisterSearchSuggestionsRoutes(rg *gin.RouterGroup, repoManager *repo.RepoManager) {
	rg.POST("/search-suggestions", searchSuggestions(repoManager))
}

// searchSuggestions handles POST /search-suggestions with a JSON body containing the search query.
func searchSuggestions(repoManager *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req SearchSuggestionsRequest
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
		suggestions, err := repoManager.GetSearchSuggestions(query)
		if err != nil {
			apitypes.RespondError(c, http.StatusInternalServerError, "Failed to retrieve search suggestions")
			return
		}

		// Respond with search suggestions
		apitypes.RespondSuccess(c, http.StatusOK, gin.H{
			"query":       query,
			"suggestions": suggestions,
		}, "Search suggestions retrieved successfully")
	}
}
