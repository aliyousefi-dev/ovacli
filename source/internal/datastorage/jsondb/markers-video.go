package jsondb

import "ova-cli/source/internal/datastorage/datatypes"

func (jsdb *JsonDB) GetMarkersForVideo(videoID string) ([]datatypes.MarkerData, error) {
	allMarkers, err := jsdb.loadMarkers()
	if err != nil {
		return nil, err
	}
	return allMarkers[videoID], nil
}

// InsertMarker adds a new marker to a video ID
func (jsdb *JsonDB) InsertMarker(videoID string, markerData datatypes.MarkerData) error {
	allMarkers, err := jsdb.loadMarkers()
	if err != nil {
		allMarkers = make(map[string][]datatypes.MarkerData)
	}
	allMarkers[videoID] = append(allMarkers[videoID], markerData)
	return jsdb.saveMarkers(allMarkers)
}

// RemoveAllMarkersFromVideo removes all markers for a video ID
func (jsdb *JsonDB) DeleteMarkersForVideo(videoID string) error {
	allMarkers, err := jsdb.loadMarkers()
	if err != nil {
		return err
	}
	delete(allMarkers, videoID)
	return jsdb.saveMarkers(allMarkers)
}
