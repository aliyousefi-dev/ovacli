package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

func (r *RepoManager) GetPlaylistsByUser(accountId string) ([]datatypes.PlaylistData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetPlaylistsByUser(accountId)
}

// CreatePlaylist assembles a new playlist and persists it to the database.
func (r *RepoManager) CreatePlaylist(accountId string, title string, description string) (*datatypes.PlaylistData, error) {
	// 1. Storage Check
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// 2. Initialize the struct (Handles ID, CoverImage, etc.)
	pl, err := datatypes.NewPlaylistData(accountId, title, description, []string{})
	if err != nil {
		return nil, fmt.Errorf("failed to initialize playlist data: %w", err)
	}

	// 3. Persist to JSON storage
	result, err := r.diskDataStorage.InsertPlaylist(pl)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// DeleteUserPlaylist removes a playlist from a user by its slug.
func (r *RepoManager) DeletePlaylistByID(accountId, playlistId string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.DeletePlaylistByID(accountId, playlistId)
}

// ReorderPlaylists updates the orderPosition of all playlists for a specific user.
func (r *RepoManager) ReorderPlaylists(userId string, playlistIds []string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}

	// We pass the userId to the storage layer to ensure the user
	// only reorders playlists they actually own.
	return r.diskDataStorage.ReorderPlaylists(userId, playlistIds)
}
