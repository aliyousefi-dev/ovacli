package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
	"strings"
)

// matchVideosByQuery returns video IDs matching the query string.
func matchVideosByQuery(videos map[string]datatypes.VideoData, query string) []string {
	query = strings.ToLower(strings.TrimSpace(query))
	var results []string

	if query == "" {
		return results
	}

	for _, video := range videos {
		if strings.Contains(strings.ToLower(video.Title), query) {
			results = append(results, video.VideoID)
		}
	}
	return results
}

// matchVideosByTags returns video IDs matching any of the provided tags.
func matchVideosByTags(videos map[string]datatypes.VideoData, tags []string) []string {
	normalizedTags := make([]string, len(tags))
	for i, tag := range tags {
		normalizedTags[i] = strings.ToLower(strings.TrimSpace(tag))
	}

	var results []string
	if len(normalizedTags) == 0 {
		return results
	}

	for _, video := range videos {
		found := false
		for _, searchTag := range normalizedTags {
			for _, videoTag := range video.Tags {
				if strings.EqualFold(searchTag, videoTag) {
					results = append(results, video.VideoID)
					found = true
					break
				}
			}
			if found {
				break // Already matched with one tag, don't add duplicates for the same video
			}
		}
	}
	return results
}

// matchVideosByMarker returns video IDs matching the marker label in markers map.
func matchVideosByMarker(markers map[string][]datatypes.MarkerData, markerLabel string) []string {
	markerLabel = strings.ToLower(strings.TrimSpace(markerLabel))
	var results []string

	if markerLabel == "" {
		return results
	}

	for videoID, markerList := range markers {
		for _, m := range markerList {
			if strings.Contains(strings.ToLower(m.Label), markerLabel) {
				results = append(results, videoID)
				break // Found a match for this video, move to next videoID
			}
		}
	}

	return results
}

// mergeAndDedupVideoIDs merges video ID slices and removes duplicates, maintaining insertion order.
func mergeAndDedupVideoIDs(lists ...[]string) []string {
	seen := make(map[string]struct{})
	var result []string

	for _, list := range lists {
		for _, id := range list {
			if _, exists := seen[id]; !exists {
				seen[id] = struct{}{}
				result = append(result, id)
			}
		}
	}
	return result
}

// SearchVideos searches videos based on the provided criteria.
// It returns a slice of matching video IDs.
func (s *JsonDB) SearchVideos(criteria datatypes.VideoSearchCriteria) ([]string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos for search: %w", err)
	}

	markers, err := s.loadMarkers()
	if err != nil {
		return nil, fmt.Errorf("failed to load markers for search: %w", err)
	}

	var matchedByQuery, matchedByTags, matchedByMarker []string

	if criteria.Query != "" {
		matchedByQuery = matchVideosByQuery(videos, criteria.Query)
	}

	if len(criteria.Tags) > 0 {
		matchedByTags = matchVideosByTags(videos, criteria.Tags)
	}

	if criteria.Marker != "" {
		matchedByMarker = matchVideosByMarker(markers, criteria.Marker)
	}

	// Merge and deduplicate all found video IDs
	results := mergeAndDedupVideoIDs(matchedByQuery, matchedByTags, matchedByMarker)

	return results, nil
}
