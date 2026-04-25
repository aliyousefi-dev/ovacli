package jsondb

import (
	"fmt"
)

// GetUserSavedVideos retrieves the full VideoData for a user's favorite videos.
// Returns an error if the user is not found or loading videos fails.
func (s *JsonDB) GetSavedVideosByAccountId(accountId string) ([]string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	saved, err := s.LoadSavedCollection()
	if err != nil {
		return nil, fmt.Errorf("failed to load users: %w", err)
	}

	videoIds, exists := saved[accountId]
	if !exists {
		return nil, fmt.Errorf("user %q not found", accountId)
	}

	return videoIds, nil
}

// AddVideoToSaved adds a video ID to a user's favorites list.
// Returns an error if the user or video is not found, or if the video is already favorited.
func (s *JsonDB) AddVideoToSaved(accountId, videoID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load users to ensure the accountId exists.
	users, err := s.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	_, userExists := users[accountId]
	if !userExists {
		return fmt.Errorf("user %q not found", accountId)
	}

	// Check if video exists in main video storage before adding to saved
	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos to check existence: %w", err)
	}
	if _, videoExists := videos[videoID]; !videoExists {
		return fmt.Errorf("video %q not found in video storage", videoID)
	}

	// Load the saved collection
	saved, err := s.LoadSavedCollection()
	if err != nil {
		return fmt.Errorf("failed to load saved collection: %w", err)
	}

	// Check if the video is already in the saved collection for this accountId
	savedVideoIDs, exists := saved[accountId]
	if exists {
		for _, savedID := range savedVideoIDs {
			if savedID == videoID {
				return fmt.Errorf("video %q is already in %q's saved collection", videoID, accountId)
			}
		}
	}

	// If the video is not already saved, append it.
	// This will also create the entry in 'saved' if accountId did not exist yet.
	saved[accountId] = append(saved[accountId], videoID)

	// Save the updated collection
	return s.SaveSavedCollection(saved)
}

// RemoveVideoFromSaved removes a video ID from a user's favorites list.
// Returns an error if the user is not found, or if the video is not in their favorites.
func (s *JsonDB) RemoveVideoFromSaved(accountId, videoID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load users to ensure the accountId exists.
	users, err := s.loadUsers()
	if err != nil {
		return fmt.Errorf("failed to load users: %w", err)
	}

	_, userExists := users[accountId]
	if !userExists {
		return fmt.Errorf("user %q not found", accountId)
	}

	// Load the saved collection
	saved, err := s.LoadSavedCollection()
	if err != nil {
		return fmt.Errorf("failed to load saved collection: %w", err)
	}

	// Get the current list of saved videos for the account
	savedVideoIDs, exists := saved[accountId]
	if !exists {
		// If the account has no saved videos, then the video can't be removed.
		return fmt.Errorf("no saved videos found for user %q", accountId)
	}

	// Create a new slice to hold videos that are *not* the one to be removed
	newSavedVideoIDs := make([]string, 0, len(savedVideoIDs))
	foundAndRemoved := false

	for _, currentVideoID := range savedVideoIDs {
		if currentVideoID == videoID {
			foundAndRemoved = true
			// Skip this video ID, effectively removing it
			continue
		}
		// Keep all other video IDs
		newSavedVideoIDs = append(newSavedVideoIDs, currentVideoID)
	}

	if !foundAndRemoved {
		// If the videoID was not found in the saved list for this account
		return fmt.Errorf("video %q not found in %q's saved collection", videoID, accountId)
	}

	// Update the saved collection with the new list (video removed)
	saved[accountId] = newSavedVideoIDs

	// Save the updated collection
	return s.SaveSavedCollection(saved)
}
