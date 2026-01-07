package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// GetVideoByID returns video data by ID.
func (r *RepoManager) GetVideoByID(id string) (*datatypes.VideoData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetVideoByID(id)
}

func (r *RepoManager) CheckVideoIndexedByID(videoID string) bool {
	// Check if video exists
	_, err := r.GetVideoByID(videoID)
	if err == nil {
		// Video exists
		return true
	}
	// Video does not exist
	return false
}
