package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// AddPlaylistToUser adds a playlist to a user's list.
func (r *RepoManager) AddPlaylistToUser(username string, pl *datatypes.PlaylistData) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.AddPlaylistToUser(username, pl)
}

// GetUserPlaylist returns a specific playlist by slug for a user.
func (r *RepoManager) GetUserPlaylist(username, slug string) (*datatypes.PlaylistData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetUserPlaylist(username, slug)
}

// DeleteUserPlaylist removes a playlist from a user by its slug.
func (r *RepoManager) DeleteUserPlaylist(username, slug string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.DeleteUserPlaylist(username, slug)
}

// SetPlaylistsOrder sets the order of playlists for a user based on a list of slugs.
func (r *RepoManager) SetPlaylistsOrder(username string, newOrderSlugs []string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.SetPlaylistsOrder(username, newOrderSlugs)
}

// UpdatePlaylistInfo updates the title and description of a playlist.
func (r *RepoManager) UpdatePlaylistInfo(username, slug, title, description string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.UpdatePlaylistInfo(username, slug, title, description)
}
