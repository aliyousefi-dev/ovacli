package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// GetSimilarVideos returns videos similar to the one identified by videoID.
func (r *RepoManager) GetSimilarVideos(videoID string) ([]datatypes.VideoData, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetSimilarVideos(videoID)
}

// SearchVideos searches videos based on criteria.
func (r *RepoManager) SearchVideos(criteria datatypes.VideoSearchCriteria) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.SearchVideos(criteria)
}

// SearchVideosWithBuckets returns paginated video IDs based on search criteria.
func (r *RepoManager) SearchVideosWithBuckets(criteria datatypes.VideoSearchCriteria, currentBucket, bucketSize int) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Perform the search to get all matching video IDs
	allResults, err := r.diskDataStorage.SearchVideos(criteria)
	if err != nil {
		return nil, fmt.Errorf("failed to search videos: %v", err)
	}

	// Calculate the starting and ending indices for pagination
	start := currentBucket * bucketSize
	end := start + bucketSize

	// Validate the range
	if start >= len(allResults) {
		return nil, fmt.Errorf("invalid bucket range, start index exceeds total results")
	}
	if end > len(allResults) {
		end = len(allResults) // Adjust if the end exceeds the total number of results
	}

	// Return the paginated video IDs
	return allResults[start:end], nil
}

// GetSearchSuggestions fetches video titles based on a partial query.
func (r *RepoManager) GetSearchSuggestions(query string) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Delegate the suggestion fetching to the appropriate data storage
	return r.diskDataStorage.GetSearchSuggestions(query)
}
