package api

import (
	"net/http"
	"time"

	"ova-cli/source/internal/repo"
	apitypes "ova-cli/source/internal/server/api-types"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// LoginRequest represents the login request body.
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// LoginResponse represents the login response body.
type LoginResponse struct {
	SessionID string `json:"sessionId"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"oldpassword"`
	NewPassword string `json:"newpassword"`
}

// RegisterAuthRoutes sets up the /auth routes with session and repo manager.
func RegisterAuthRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	auth := rg.Group("/auth")
	{
		auth.POST("/login", func(c *gin.Context) { loginHandler(c, repoMgr) })
		auth.POST("/logout", func(c *gin.Context) { logoutHandler(c, repoMgr) })
		auth.GET("/status", func(c *gin.Context) { authStatusHandler(c, repoMgr) })
		auth.POST("/password", func(c *gin.Context) { passwordHandler(c, repoMgr) })
	}
}

// loginHandler authenticates the user and issues a session.
func loginHandler(c *gin.Context, repoMgr *repo.RepoManager) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apitypes.RespondError(c, http.StatusBadRequest, "Invalid JSON")
		return
	}

	user, err := repoMgr.GetUserByUsername(req.Username)
	if err != nil {
		apitypes.RespondError(c, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		apitypes.RespondError(c, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	// Generate a new session ID
	sessionID := uuid.NewString()
	repoMgr.AddSession(sessionID, user.AccountID)

	// Set the session ID in the HttpOnly cookie
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		MaxAge:   int(24 * time.Hour.Seconds()), // Session expires in 24 hours
		HttpOnly: true,                          // Ensure the cookie is only accessible via HTTP (not JavaScript)
		Secure:   false,                         // Use true if you're using HTTPS
	})

	// Respond with a success message, without exposing the session ID
	apitypes.RespondSuccess(c, http.StatusOK, nil, "Login successful")
}

func logoutHandler(c *gin.Context, repoMgr *repo.RepoManager) {
	sessionID, err := c.Cookie("session_id")
	if err != nil {
		apitypes.RespondError(c, http.StatusUnauthorized, "No session found")
		return
	}

	accountId, err := repoMgr.GetAccountIDBySession(sessionID)
	if err != nil || accountId == "" {
		apitypes.RespondError(c, http.StatusUnauthorized, "Invalid session")
		return
	}

	repoMgr.DeleteSession(sessionID)

	clearCookie := "session_id=; Path=/; Max-Age=0; HttpOnly; SameSite=None;"
	c.Writer.Header().Add("Set-Cookie", clearCookie)

	apitypes.RespondSuccess(c, http.StatusOK, gin.H{}, "Logged out successfully")
}

func authStatusHandler(c *gin.Context, repoMgr *repo.RepoManager) {
	if !repoMgr.AuthEnabled {
		apitypes.RespondSuccess(c, http.StatusOK, gin.H{
			"authenticated": true,
			"username":      "guest",
		}, "Auth disabled: automatic success")
		return
	}

	sessionID, err := c.Cookie("session_id")
	if err != nil {
		apitypes.RespondSuccess(c, http.StatusOK, gin.H{"authenticated": false}, "Not authenticated")
		return
	}

	accountId, _ := repoMgr.GetAccountIDBySession(sessionID)
	if accountId != "" {

		userdata, _ := repoMgr.GetUserByAccountID(accountId)

		apitypes.RespondSuccess(c, http.StatusOK, gin.H{
			"authenticated": true,
			"accountId":     userdata.AccountID,
			"username":      userdata.Username,
		}, "Status check successful")
	} else {
		apitypes.RespondSuccess(c, http.StatusOK, gin.H{"authenticated": false}, "Not authenticated")
	}
}

func passwordHandler(c *gin.Context, repoMgr *repo.RepoManager) {
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apitypes.RespondError(c, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	sessionID, err := c.Cookie("session_id")
	if err != nil {
		apitypes.RespondSuccess(c, http.StatusOK, gin.H{"authenticated": false}, "Not authenticated")
		return
	}

	accountId, _ := repoMgr.GetAccountIDBySession(sessionID)
	if accountId == "" {
		apitypes.RespondError(c, http.StatusUnauthorized, "Not authenticated")
		return
	}

	user, err := repoMgr.GetUserByUsername(accountId)
	if err != nil {
		apitypes.RespondError(c, http.StatusUnauthorized, "Invalid username")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)); err != nil {
		apitypes.RespondError(c, http.StatusUnauthorized, "Invalid password")
		return
	}

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		apitypes.RespondError(c, http.StatusInternalServerError, "Cannot create hash from password")
		return
	}
	hashedPassword := string(hashBytes)

	if err := repoMgr.UpdateUserPassword(accountId, hashedPassword); err != nil {
		apitypes.RespondError(c, http.StatusForbidden, err.Error())
	} else {
		apitypes.RespondSuccess(c, http.StatusOK, gin.H{"status": "ok"}, "Password changed!")
	}
}
