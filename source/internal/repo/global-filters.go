package repo

import (
	"fmt"
	"ova-cli/source/internal/datastorage/datatypes"
)

func (r *RepoManager) GetGlobalFilters() ([]datatypes.GlobalFilter, error) {

	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetGlobalFilters()
}
