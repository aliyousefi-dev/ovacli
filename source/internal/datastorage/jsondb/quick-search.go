package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
	"strings"
)

// GetSearchSuggestions returns a list of video titles and unique tags that partially match the search query.
func (s *JsonDB) QuickSearch(query string) ([]datatypes.QuickSearchItemResult, error) {
	// Lock the JSONDB to ensure thread-safety
	s.mu.Lock()
	defer s.mu.Unlock()

	// Trim and prepare the query
	query = strings.TrimSpace(query)
	if query == "" {
		return nil, fmt.Errorf("search query cannot be empty")
	}
	var results []datatypes.QuickSearchItemResult
	// Use a map to keep track of added tags to avoid duplicates
	addedTags := make(map[string]struct{})

	videosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	// Convert map to slice
	videos := make([]datatypes.VideoData, 0, len(videosMap))
	for _, video := range videosMap {
		videos = append(videos, video)
	}

	// Lowercase the query once for efficiency
	lowerQuery := strings.ToLower(query)

	for _, video := range videos {
		// Check for title match
		if strings.Contains(strings.ToLower(video.Title), lowerQuery) {
			results = append(results, datatypes.QuickSearchItemResult{
				Type:  "video",
				Label: video.Title,
			})
		}

		// Check for tag matches
		for _, tag := range video.Tags { // Assuming video.Tags is a slice of strings
			lowerTag := strings.ToLower(tag)
			if strings.Contains(lowerTag, lowerQuery) {
				// Check if this tag has already been added
				if _, exists := addedTags[lowerTag]; !exists {
					results = append(results, datatypes.QuickSearchItemResult{
						Type:  "tag",
						Label: tag, // Use the original casing of the tag for the label
					})
					// Mark this tag as added
					addedTags[lowerTag] = struct{}{}
				}
			}
		}
	}

	// Return the suggestions
	return results, nil
}
