package jsondb

import "fmt"

func (s *JsonDB) DeleteVideoByID(videoId string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	delete(videos, videoId)

	// Load markers and delete the corresponding marker entry
	markers, err := s.loadMarkers()
	if err != nil {
		return fmt.Errorf("failed to load markers: %w", err)
	}
	delete(markers, videoId) // It's okay to delete a key that doesn't exist

	// Save the updated markers
	err = s.saveMarkers(markers)
	if err != nil {
		return fmt.Errorf("failed to save markers: %w", err)
	}

	lookup, err := s.LoadLookupCollection()
	if err != nil {
		return fmt.Errorf("failed to load lookups: %w", err)
	}
	delete(lookup, videoId) // It's okay to delete a key that doesn't exist

	err = s.SaveLookupCollection(lookup)
	if err != nil {
		return fmt.Errorf("failed to save lookup collection: %w", err)
	}

	// Save the updated videos
	err = s.saveVideos(videos)
	if err != nil {
		return fmt.Errorf("failed to save videos: %w", err)
	}

	return nil // Success
}
