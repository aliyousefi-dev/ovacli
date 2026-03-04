package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// SearchVideos searches videos based on criteria.
func (r *RepoManager) SearchVideos(criteria datatypes.VideoSearchCriteria) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("%s", ErrDataStorageNotInitialized)
	}
	return r.diskDataStorage.SearchVideos(criteria)
}

// SearchVideosPaginated returns paginated video IDs based on search criteria.
// curent bucket start from 1
func (r *RepoManager) SearchVideosPaginated(criteria datatypes.VideoSearchCriteria, page, limit int, sortMode SortMode) ([]datatypes.VideoData, int, error) {
	if !r.IsDataStorageInitialized() {
		return nil, 0, fmt.Errorf("%s", ErrDataStorageNotInitialized)
	}

	// Perform the search to get all matching video IDs
	allResults, err := r.diskDataStorage.SearchVideos(criteria)
	if err != nil {
		return nil, 0, fmt.Errorf("%s : %v", ErrSearchFailed, err)
	}

	videos, err := r.GetVideosByIDs(allResults)
	if err != nil || videos == nil {
		return nil, 0, fmt.Errorf("failed")
	}

	sortedResult := make([]datatypes.VideoData, 0, len(videos))

	if sortMode != "" {
		for _, p := range videos {
			if p != nil { // guard against nil pointers
				sortedResult = append(sortedResult, *p)
			}
		}
		SortVideos(sortedResult, sortMode)
	}

	startIndex := (page - 1) * limit
	endIndex := startIndex + limit

	if startIndex < 0 {
		startIndex = 0
	}

	if endIndex > len(sortedResult) {
		endIndex = len(sortedResult)
	}

	paginatedVideos := sortedResult[startIndex:endIndex]
	totalCount := len(sortedResult)

	return paginatedVideos, totalCount, nil
}
