package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
	"sort"
)

// SearchVideos searches videos based on criteria.
func (r *RepoManager) SearchVideos(criteria datatypes.VideoSearchCriteria) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("%s", ErrDataStorageNotInitialized)
	}
	return r.diskDataStorage.SearchVideos(criteria)
}

// SearchVideosWithBuckets returns paginated video IDs based on search criteria.
// curent bucket start from 1
func (r *RepoManager) SearchVideosWithBuckets(criteria datatypes.VideoSearchCriteria, selectedBucket, maxBucketSize int) (datatypes.BucketSearchResult, error) {
	if !r.IsDataStorageInitialized() {
		return datatypes.BucketSearchResult{}, fmt.Errorf("%s", ErrDataStorageNotInitialized)
	}

	// Perform the search to get all matching video IDs
	allResults, err := r.diskDataStorage.SearchVideos(criteria)
	if err != nil {
		return datatypes.BucketSearchResult{}, fmt.Errorf("%s : %v", ErrSearchFailed, err)
	}

	// Sort alphabetically (A → Z)
	sort.Strings(allResults)

	totalVideos := len(allResults)

	// Handle case where search finds nothing
	if totalVideos == 0 {
		return datatypes.BucketSearchResult{
			VideoIDs:      []string{},
			TotalVideos:   0,
			TotalBuckets:  0,
			CurrentBucket: selectedBucket,
		}, nil
	}

	// Calculate total buckets (rounding up)
	totalBuckets := 0
	if maxBucketSize > 0 {
		totalBuckets = (totalVideos + maxBucketSize - 1) / maxBucketSize
	}

	// Calculate the starting and ending indices for pagination
	start := (selectedBucket - 1) * maxBucketSize
	end := start + maxBucketSize

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
		CurrentBucket: selectedBucket,
	}, nil
}
