package datatypes

import (
	"fmt"

	gonanoid "github.com/matoous/go-nanoid/v2"
)

// PlaylistData represents a single playlist.
type PlaylistData struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	CoverImage  string   `json:"coverImageUrl"` // Adapted from coverImageUrl in ts interface
	VideoCount  int      `json:"videoCount"`
	Order       int      `json:"orderPosition"`
	VideoIDs    []string `json:"videoIds"`    // Additional: necessary for backend
	OwnerUserId string   `json:"ownerUserId"` // The owner/user who created this playlist
}

// NewPlaylistData returns an example playlist map.
func NewPlaylistData(userId string, title string, desc string, videoIds []string) (*PlaylistData, error) {
	// 1. Handle NanoID safely
	id, err := gonanoid.New(11)
	if err != nil {
		return nil, fmt.Errorf("could not generate id: %w", err)
	}

	// 2. Ensure videoIds is never nil (prevents "null" in JSON)
	if videoIds == nil {
		videoIds = []string{}
	}

	// 3. Dynamic Cover Image
	// If there are videos, use the first one as the cover
	var coverImage string
	if len(videoIds) > 0 {
		coverImage = "/api/v1/thumbnail/" + videoIds[0]
	}

	return &PlaylistData{
		ID:          id,
		Title:       title,
		Description: desc, // Pass the actual desc, or "" if empty
		CoverImage:  coverImage,
		VideoCount:  len(videoIds),
		Order:       0, // DB logic will overwrite this based on MaxOrder
		VideoIDs:    videoIds,
		OwnerUserId: userId,
	}, nil
}
