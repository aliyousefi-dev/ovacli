package repo

import (
	"fmt"
	"ova-cli/source/internal/datastorage/datatypes"
	"sort"
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
func (r *RepoManager) SearchVideosWithBuckets(criteria datatypes.VideoSearchCriteria, currentBucket, bucketSize int) (datatypes.BucketSearchResult, error) {
	if !r.IsDataStorageInitialized() {
		return datatypes.BucketSearchResult{}, fmt.Errorf("data storage is not initialized")
	}

	// Perform the search to get all matching video IDs
	allResults, err := r.diskDataStorage.SearchVideos(criteria)
	if err != nil {
		return datatypes.BucketSearchResult{}, fmt.Errorf("failed to search videos: %v", err)
	}

	// Sort alphabetically (A → Z)
	sort.Strings(allResults)

	totalVideos := len(allResults)

	// Calculate total buckets (rounding up)
	totalBuckets := 0
	if bucketSize > 0 {
		totalBuckets = (totalVideos + bucketSize - 1) / bucketSize
	}

	// Calculate the starting and ending indices for pagination
	start := currentBucket * bucketSize
	end := start + bucketSize

	// Handle case where search finds nothing
	if totalVideos == 0 {
		return datatypes.BucketSearchResult{
			VideoIDs:      []string{},
			TotalVideos:   0,
			TotalBuckets:  0,
			CurrentBucket: currentBucket,
		}, nil
	}

	// Validate the range
	if start >= totalVideos {
		return datatypes.BucketSearchResult{}, fmt.Errorf("invalid bucket range, start index %d exceeds total results %d", start, totalVideos)
	}

	if end > totalVideos {
		end = totalVideos
	}

	// Return the populated struct
	return datatypes.BucketSearchResult{
		VideoIDs:      allResults[start:end],
		TotalVideos:   totalVideos,
		TotalBuckets:  totalBuckets,
		CurrentBucket: currentBucket,
	}, nil
}

// GetSearchSuggestions fetches video titles based on a partial query.
func (r *RepoManager) GetSearchSuggestions(query string) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Delegate the suggestion fetching to the appropriate data storage
	return r.diskDataStorage.GetSearchSuggestions(query)
}
