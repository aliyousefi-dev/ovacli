package jsondb

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
	"strings"
)

// quickSearchVideos returns video title matches for the query.
func quickSearchVideos(videosMap map[string]datatypes.VideoData, query string) []datatypes.QuickSearchItemResult {
	query = strings.ToLower(strings.TrimSpace(query))
	var results []datatypes.QuickSearchItemResult

	if query == "" {
		return results
	}

	for _, video := range videosMap {
		if strings.Contains(strings.ToLower(video.Title), query) {
			results = append(results, datatypes.QuickSearchItemResult{
				Type:  "video",
				Label: video.Title,
			})
		}
	}

	return results
}

// quickSearchTags returns unique tag matches for the query.
func quickSearchTags(videosMap map[string]datatypes.VideoData, query string) []datatypes.QuickSearchItemResult {
	query = strings.ToLower(strings.TrimSpace(query))
	var results []datatypes.QuickSearchItemResult
	addedTags := make(map[string]struct{})

	if query == "" {
		return results
	}

	for _, video := range videosMap {
		for _, tag := range video.Tags {
			lowerTag := strings.ToLower(tag)
			if strings.Contains(lowerTag, query) {
				if _, exists := addedTags[lowerTag]; !exists {
					results = append(results, datatypes.QuickSearchItemResult{
						Type:  "tag",
						Label: tag,
					})
					addedTags[lowerTag] = struct{}{}
				}
			}
		}
	}

	return results
}

func quickSearchVideosByMarker(markers map[string][]datatypes.MarkerData, markerLabel string) []datatypes.QuickSearchItemResult {
	markerLabel = strings.ToLower(strings.TrimSpace(markerLabel))
	var results []datatypes.QuickSearchItemResult
	seen := make(map[string]struct{}) // To avoid duplicate labels

	if markerLabel == "" {
		return results
	}

	for _, markerList := range markers {
		for _, m := range markerList {
			lowerLabel := strings.ToLower(m.Label)
			if strings.Contains(lowerLabel, markerLabel) {
				if _, exists := seen[m.Label]; !exists {
					results = append(results, datatypes.QuickSearchItemResult{
						Type:  "marker",
						Label: m.Label,
					})
					seen[m.Label] = struct{}{}
				}
			}
		}
	}

	return results
}

// QuickSearch returns a combined list of video titles, unique tags, and unique marker labels that partially match the search query.
func (s *JsonDB) QuickSearch(query string) ([]datatypes.QuickSearchItemResult, error) {
	// Lock the JSONDB to ensure thread-safety
	s.mu.Lock()
	defer s.mu.Unlock()

	// Trim and prepare the query
	query = strings.TrimSpace(query)
	if query == "" {
		return nil, fmt.Errorf("search query cannot be empty")
	}

	videosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	videoResults := quickSearchVideos(videosMap, query)
	tagResults := quickSearchTags(videosMap, query)

	markers, err := s.loadMarkers()
	if err != nil {
		return nil, fmt.Errorf("failed to load markers for search: %w", err)
	}
	markerResults := quickSearchVideosByMarker(markers, query)

	// Combine all results (videos, tags, markers)
	allResults := append(videoResults, tagResults...)
	allResults = append(allResults, markerResults...)
	return allResults, nil
}
