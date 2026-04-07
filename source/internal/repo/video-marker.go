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

func (r *RepoManager) RemoveMarkerFromVideo(videoID string, timeSeconds int) error {

	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}
	err := r.diskDataStorage.RemoveMarker(videoID, timeSeconds)
	if err != nil {
		return err
	}

	return nil
}
