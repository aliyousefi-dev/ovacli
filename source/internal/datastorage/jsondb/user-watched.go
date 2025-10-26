package jsondb

import (
	"fmt"
)

// AddVideoToWatched adds a video to the watched list for a given user.
func (s *JsonDB) AddVideoToWatched(accountid, videoID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load all watched videos
	videos, err := s.loadWatched()
	if err != nil {
		return fmt.Errorf("failed to load watched videos: %w", err)
	}

	// Check if the user exists in the watched videos map
	userVideos, exists := videos[accountid]
	if !exists {
		// If the user does not exist, initialize their watched list
		userVideos = []string{}
	}

	// Check if video already in watched list
	for _, v := range userVideos {
		if v == videoID {
			return nil // already watched, no need to add again
		}
	}

	// Optionally check if video exists in global video storage
	videoStorage, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load video storage: %w", err)
	}
	if _, videoExists := videoStorage[videoID]; !videoExists {
		return fmt.Errorf("video %q not found in video storage", videoID)
	}

	// Append the new video ID to the user's watched list
	userVideos = append(userVideos, videoID)

	// Update the map with the new watched videos list for the user
	videos[accountid] = userVideos

	// Save the updated watched videos data
	if err := s.saveWatched(videos); err != nil {
		return fmt.Errorf("failed to save updated watched videos: %w", err)
	}

	return nil
}

func (s *JsonDB) GetUserWatchedVideos(accountid string) ([]string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load all watched videos (since we're working with the new structure)
	videos, err := s.loadWatched()
	if err != nil {
		return nil, fmt.Errorf("failed to load watched videos: %w", err)
	}

	// Find the user by account ID
	watchedVideos, exists := videos[accountid]
	if !exists {
		return nil, fmt.Errorf("user %q not found", accountid)
	}

	return watchedVideos, nil
}

// ClearUserWatchedHistory clears all watched videos for a given user.
func (s *JsonDB) ClearUserWatchedHistory(accountid string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load all watched videos (not users anymore)
	videos, err := s.loadWatched()
	if err != nil {
		return fmt.Errorf("failed to load watched videos: %w", err)
	}

	// Find the user by account ID and clear their watched videos
	if _, exists := videos[accountid]; exists {
		delete(videos, accountid) // Remove the user's entry from the map
	} else {
		return fmt.Errorf("user %q not found", accountid)
	}

	// Save the updated videos data back to storage
	if err := s.saveWatched(videos); err != nil {
		return fmt.Errorf("failed to save updated watched videos: %w", err)
	}

	return nil
}
