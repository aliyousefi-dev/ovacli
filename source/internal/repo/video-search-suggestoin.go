package repo

import (
	"fmt"
)

// GetSearchSuggestions fetches video titles based on a partial query.
func (r *RepoManager) GetSearchSuggestions(query string) ([]string, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Delegate the suggestion fetching to the appropriate data storage
	return r.diskDataStorage.GetSearchSuggestions(query)
}
