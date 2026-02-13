package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// --- User Playlist Management ---

func (s *JsonDB) AddPlaylist(pl *datatypes.PlaylistData) (*datatypes.PlaylistData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// 1. Load the existing collection
	playlists, err := s.LoadPlaylistCollection()
	if err != nil {
		return nil, fmt.Errorf("failed to load playlist collection: %w", err)
	}

	// 2. Safety: Ensure we don't overwrite an existing ID
	if _, exists := playlists[pl.ID]; exists {
		return nil, fmt.Errorf("playlist with ID %s already exists", pl.ID)
	}

	// 3. Calculate Order Position
	// We only care about the max order of playlists owned by this specific user
	maxOrder := 0
	for _, p := range playlists {
		if p.OwnerUserId == pl.OwnerUserId {
			if p.Order > maxOrder {
				maxOrder = p.Order
			}
		}
	}

	// 4. Assign the next position if it's a new playlist (Order == 0)
	if pl.Order == 0 {
		pl.Order = maxOrder + 1
	}

	// 5. Add to the map
	playlists[pl.ID] = *pl

	// 6. Save the updated map to playlists.json
	if err := s.SavePlaylistCollection(playlists); err != nil {
		return nil, fmt.Errorf("failed to save playlist: %w", err)
	}

	return pl, nil
}

// GetUserPlaylist finds a specific playlist for a user by its slug.
// Returns a pointer to a copy of PlaylistData if found, or an error if the user or playlist is not found.
func (s *JsonDB) GetPlaylistByID(userId, playlistId string) (*datatypes.PlaylistData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load the existing collections
	playlists, err := s.LoadPlaylistCollection()
	if err != nil {
		return nil, fmt.Errorf("failed to load playlist collection: %w", err)
	}

	for _, p := range playlists {
		if p.OwnerUserId == userId && p.ID == playlistId {
			// Return a copy to ensure callers cannot mutate internal state
			plCopy := p
			return &plCopy, nil
		}
	}

	return nil, fmt.Errorf("playlist with id %q not found for user %q", playlistId, userId)
}

// DeleteUserPlaylist removes a playlist from a user's collection by its id.
// Returns an error if the user or playlist is not found.
func (s *JsonDB) DeletePlaylistByID(userId, playlistId string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load the existing collection
	playlists, err := s.LoadPlaylistCollection()
	if err != nil {
		return fmt.Errorf("failed to load playlist collection: %w", err)
	}

	playlist, exists := playlists[playlistId]
	if !exists {
		return fmt.Errorf("playlist with id %q not found", playlistId)
	}
	if playlist.OwnerUserId != userId {
		return fmt.Errorf("playlist with id %q does not belong to user %q", playlistId, userId)
	}

	delete(playlists, playlistId)

	if err := s.SavePlaylistCollection(playlists); err != nil {
		return fmt.Errorf("failed to save playlist collection after deleting: %w", err)
	}

	return nil
}

func (s *JsonDB) AddVideoToPlaylist(userId, playlistId, videoId string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load the existing playlist collection
	playlists, err := s.LoadPlaylistCollection()
	if err != nil {
		return fmt.Errorf("failed to load playlist collection: %w", err)
	}

	playlist, exists := playlists[playlistId]
	if !exists {
		return fmt.Errorf("playlist with id %q not found", playlistId)
	}

	if playlist.OwnerUserId != userId {
		return fmt.Errorf("playlist with id %q does not belong to user %q", playlistId, userId)
	}

	// Check if videoId already exists
	for _, vid := range playlist.VideoIDs {
		if vid == videoId {
			return fmt.Errorf("video %q already exists in playlist %q", videoId, playlistId)
		}
	}

	// Add the video to the playlist
	playlist.VideoIDs = append(playlist.VideoIDs, videoId)
	playlist.VideoCount = len(playlist.VideoIDs)
	playlists[playlistId] = playlist

	if err := s.SavePlaylistCollection(playlists); err != nil {
		return fmt.Errorf("failed to save updated playlist collection: %w", err)
	}

	return nil
}

// RemoveVideoFromPlaylist removes a video ID from a specific playlist of a user.
// Returns an error if the user, playlist, or video (within the playlist) is not found.
func (s *JsonDB) RemoveVideoFromPlaylist(userId, playlistId, videoId string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load the existing playlist collection
	playlists, err := s.LoadPlaylistCollection()
	if err != nil {
		return fmt.Errorf("failed to load playlist collection: %w", err)
	}

	playlist, exists := playlists[playlistId]
	if !exists {
		return fmt.Errorf("playlist with id %q not found", playlistId)
	}

	if playlist.OwnerUserId != userId {
		return fmt.Errorf("playlist with id %q does not belong to user %q", playlistId, userId)
	}

	// Find the index of the video to remove
	indexToRemove := -1
	for i, vid := range playlist.VideoIDs {
		if vid == videoId {
			indexToRemove = i
			break
		}
	}

	if indexToRemove == -1 {
		return fmt.Errorf("video %q not found in playlist %q", videoId, playlistId)
	}

	playlist.VideoIDs = append(playlist.VideoIDs[:indexToRemove], playlist.VideoIDs[indexToRemove+1:]...)
	playlist.VideoCount = len(playlist.VideoIDs)
	playlists[playlistId] = playlist

	if err := s.SavePlaylistCollection(playlists); err != nil {
		return fmt.Errorf("failed to save updated playlist collection after removing video: %w", err)
	}

	return nil
}

func (s *JsonDB) ReorderPlaylists(userId string, newOrderPlaylistIds []string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load the existing playlist collection
	playlists, err := s.LoadPlaylistCollection()
	if err != nil {
		return fmt.Errorf("failed to load playlist collection: %w", err)
	}

	// Create a map for quick lookup of playlist IDs that belong to the user
	userPlaylistIds := make(map[string]struct{})
	for _, p := range playlists {
		if p.OwnerUserId == userId {
			userPlaylistIds[p.ID] = struct{}{}
		}
	}

	// Validation: Make sure all playlistIds in newOrderPlaylistIds actually belong to the user
	for _, pid := range newOrderPlaylistIds {
		if _, ok := userPlaylistIds[pid]; !ok {
			return fmt.Errorf("playlist id %q does not belong to user %q", pid, userId)
		}
	}

	// Set new order: The first id in the slice gets order 1, etc.
	for order, pid := range newOrderPlaylistIds {
		playlist := playlists[pid]
		playlist.Order = order + 1
		playlists[pid] = playlist
	}

	// Save updated playlists collection
	if err := s.SavePlaylistCollection(playlists); err != nil {
		return fmt.Errorf("failed to save reordered playlists: %w", err)
	}

	return nil
}

func (s *JsonDB) UpdatePlaylistInfo(userId, playlistId, newTitle, newDescription string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	// Load the existing playlist collection
	playlists, err := s.LoadPlaylistCollection()
	if err != nil {
		return fmt.Errorf("failed to load playlist collection: %w", err)
	}

	playlist, exists := playlists[playlistId]
	if !exists {
		return fmt.Errorf("playlist with id %q not found", playlistId)
	}

	// Check if the playlist belongs to the given user
	if playlist.OwnerUserId != userId {
		return fmt.Errorf("playlist with id %q does not belong to user %q", playlistId, userId)
	}

	playlist.Title = newTitle
	playlist.Description = newDescription

	playlists[playlistId] = playlist

	if err := s.SavePlaylistCollection(playlists); err != nil {
		return fmt.Errorf("failed to save playlist updates: %w", err)
	}

	return nil
}

func (s *JsonDB) GetPlaylistVideoIDsPaginated(userId, playlistId string, page, limit int) ([]string, int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// 1. Load the existing collection
	playlists, err := s.LoadPlaylistCollection()
	if err != nil {
		return nil, 0, fmt.Errorf("failed to load playlist collection: %w", err)
	}

	playlist, exists := playlists[playlistId]
	if !exists {
		return nil, 0, fmt.Errorf("playlist not found")
	}

	// 2. Ownership Check
	if playlist.OwnerUserId != userId {
		return nil, 0, fmt.Errorf("access denied")
	}

	totalVideos := len(playlist.VideoIDs)

	// 3. Calculate Slicing Logic (Page 1 starts at index 0)
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	} // Default limit

	startIndex := (page - 1) * limit
	endIndex := startIndex + limit

	// 4. Boundary Safety Checks
	if startIndex >= totalVideos {
		return []string{}, totalVideos, nil // Return empty slice if page is out of range
	}

	if endIndex > totalVideos {
		endIndex = totalVideos
	}

	// 5. Return the slice and the total count
	// Returning the total count allows the frontend to calculate how many pages exist
	return playlist.VideoIDs[startIndex:endIndex], totalVideos, nil
}

// GetAllUserPlaylists returns a slice of all playlists belonging to a given user.
func (s *JsonDB) GetPlaylistsByUser(userId string) ([]datatypes.PlaylistData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	playlists, err := s.LoadPlaylistCollection()
	if err != nil {
		return nil, fmt.Errorf("failed to load playlist collection: %w", err)
	}

	var userPlaylists []datatypes.PlaylistData
	for _, p := range playlists {
		if p.OwnerUserId == userId {
			userPlaylists = append(userPlaylists, p)
		}
	}

	return userPlaylists, nil
}
