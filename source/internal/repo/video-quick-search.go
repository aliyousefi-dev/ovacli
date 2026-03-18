package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

// QuickSearch fetches video titles based on a partial query.
func (r *RepoManager) QuickSearch(query string) ([]datatypes.QuickSearchItemResult, error) {
	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}

	// Delegate the suggestion fetching to the appropriate data storage
	return r.diskDataStorage.QuickSearch(query)
}
