package jsondb

import "ova-cli/source/internal/datastorage/datatypes"

// Get all video markers (returns the map of video IDs to array of VideoMarkerData)
func (jsdb *JsonDB) GetAllMarkers() (map[string][]datatypes.VideoMarkerData, error) {
	return jsdb.loadMarkers()
}

func (jsdb *JsonDB) GetMarkersByVideoId(videoID string) ([]datatypes.VideoMarkerData, error) {
	allMarkers, err := jsdb.GetAllMarkers()
	if err != nil {
		return nil, err
	}
	return allMarkers[videoID], nil
}

// AddMarker adds a new marker to a video ID
func (jsdb *JsonDB) AddMarker(videoID string, markerData datatypes.VideoMarkerData) error {
	allMarkers, err := jsdb.loadMarkers()
	if err != nil {
		allMarkers = make(map[string][]datatypes.VideoMarkerData)
	}
	allMarkers[videoID] = append(allMarkers[videoID], markerData)
	return jsdb.saveMarkers(allMarkers)
}

// SaveMarker replaces all markers for a given video ID with a single marker
func (jsdb *JsonDB) SaveMarker(videoID string, markerData datatypes.VideoMarkerData) error {
	allMarkers, err := jsdb.loadMarkers()
	if err != nil {
		allMarkers = make(map[string][]datatypes.VideoMarkerData)
	}
	allMarkers[videoID] = []datatypes.VideoMarkerData{markerData}
	return jsdb.saveMarkers(allMarkers)
}

// DeleteMarker removes all markers for a video ID
func (jsdb *JsonDB) DeleteMarker(videoID string) error {
	allMarkers, err := jsdb.GetAllMarkers()
	if err != nil {
		return err
	}
	delete(allMarkers, videoID)
	return jsdb.saveMarkers(allMarkers)
}

// DeleteMarkerAtIndex removes a specific marker by index from a video ID
func (jsdb *JsonDB) DeleteMarkerAtIndex(videoID string, index int) error {
	allMarkers, err := jsdb.GetAllMarkers()
	if err != nil {
		return err
	}
	markers, exists := allMarkers[videoID]
	if !exists || index < 0 || index >= len(markers) {
		return ErrMarkerNotFound
	}
	allMarkers[videoID] = append(markers[:index], markers[index+1:]...)
	return jsdb.saveMarkers(allMarkers)
}

// MarkerExists checks if any markers exist for a given video ID
func (jsdb *JsonDB) MarkerExists(videoID string) (bool, error) {
	allMarkers, err := jsdb.GetAllMarkers()
	if err != nil {
		return false, err
	}
	markers, exists := allMarkers[videoID]
	return exists && len(markers) > 0, nil
}
