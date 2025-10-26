package datatypes

import (
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// UserData represents a user's profile and associated data.
type UserData struct {
	DisplayName  string         `json:"displayName"`
	Username     string         `json:"username"`
	AccountID    string         `json:"accountId"`
	PasswordHash string         `json:"passwordHash"`
	Favorites    []string       `json:"favorites"` // Stores VideoIDs
	Playlists    []PlaylistData `json:"playlists"` // Embedded user-specific playlists
	Watched      []string       `json:"watched"`   // Stores VideoIDs the user has watched
	CreatedAt    time.Time      `json:"createdAt"`
	LastLoginAt  time.Time      `json:"lastLoginAt,omitempty"` // omitempty for zero-valued time
}

// NewUserData returns an initialized UserData struct for a new user.
func NewUserData(username string, password string) UserData {
	// Hash password
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return UserData{}
	}

	// Generate a new account ID
	accountId := uuid.New().String()

	return UserData{
		Username:     username,
		AccountID:    accountId,
		PasswordHash: string(hashedPass),
		CreatedAt:    time.Now().UTC(),
		LastLoginAt:  time.Time{},      // Zero value for LastLoginAt
		Favorites:    []string{},       // Initialize with empty slice
		Playlists:    []PlaylistData{}, // Initialize with empty slice
		Watched:      []string{},       // Initialize with empty slice
	}
}
