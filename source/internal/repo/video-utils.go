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

func (r *RepoManager) GetVideosByIDs(ids []string) ([]*datatypes.VideoData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	videos := make([]*datatypes.VideoData, 0, len(ids))
	for _, id := range ids {
		video, err := r.GetVideoByID(id)
		if err != nil {
			return nil, err
		}
		videos = append(videos, video)
	}

	return videos, nil
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
