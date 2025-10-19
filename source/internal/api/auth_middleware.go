package api

import (
	"net/http"
	"ova-cli/source/internal/repo"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(repoMgr *repo.RepoManager, publicPaths map[string]bool, publicPrefixes []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !repoMgr.AuthEnabled {
			// Skip all authentication checks
			c.Next()
			return
		}

		path := c.Request.URL.Path

		if publicPaths[path] {
			c.Next()
			return
		}

		for _, prefix := range publicPrefixes {
			if strings.HasPrefix(path, prefix) {
				c.Next()
				return
			}
		}

		sessionID, err := c.Cookie("session_id")
		if err != nil {
			respondError(c, http.StatusUnauthorized, "Authentication required")
			c.Abort()
			return
		}

		accountID, ok := repoMgr.GetAccountIDBySession(sessionID)
		if ok != nil {
			respondError(c, http.StatusUnauthorized, "Invalid session")
			c.Abort()
			return
		}

		c.Set("accountId", accountID)
		c.Next()
	}
}
