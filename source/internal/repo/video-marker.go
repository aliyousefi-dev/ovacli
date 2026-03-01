package repo

import (
	"fmt"
	"ova-cli/source/internal/datatypes"
)

func (r *RepoManager) AddMarkerToVideo(videoID string, marker datatypes.MarkerData) error {

	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	err := r.diskDataStorage.InsertMarker(videoID, marker)
	if err != nil {
		return err
	}

	return nil
}

func (r *RepoManager) GetMarkersByVideoID(videoID string) ([]datatypes.MarkerData, error) {

	if !r.IsDataStorageInitialized() {
		return nil, fmt.Errorf("data storage is not initialized")
	}
	return r.diskDataStorage.GetMarkersForVideo(videoID)
}
