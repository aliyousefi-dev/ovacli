package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// GetUserPlaylist returns a specific playlist by slug for a user.
func (r *RepoManager) GetPlaylistByID(userId, playlistId string) (*datatypes.PlaylistData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetPlaylistByID(userId, playlistId)
}

// UpdatePlaylistInfo updates the title and description of a playlist.
func (r *RepoManager) UpdateUserPlaylistDetails(userId, playlistId, title, description string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.UpdatePlaylistInfo(userId, playlistId, title, description)
}

// AddVideoToPlaylist adds a video ID to a specific playlist.
func (r *RepoManager) AddVideoToPlaylist(userId, playlistId, videoID string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.AddVideoToPlaylist(userId, playlistId, videoID)
}

// RemoveVideoFromPlaylist removes a video ID from a specific playlist.
func (r *RepoManager) RemoveVideoFromPlaylist(userId, playlistId, videoID string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.RemoveVideoFromPlaylist(userId, playlistId, videoID)
}

func (r *RepoManager) GetPlaylistVideoIDsPaginated(userId, playlistId string, page, limit int) ([]*datatypes.VideoData, int, error) {
	if !r.IsDataStorageInitialized() {
		return nil, 0, fmt.Errorf("data storage is not initialized")
	}

	ids, total, err := r.diskDataStorage.GetPlaylistVideoIDsPaginated(userId, playlistId, page, limit)
	if err != nil {
		return nil, 0, err
	}

	videos, err := r.GetVideosByIDs(ids)
	if err != nil {
		return nil, 0, err
	}

	return videos, total, nil
}
