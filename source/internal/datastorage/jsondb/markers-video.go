package jsondb

import "ova-cli/source/internal/datatypes"

func (jsdb *JsonDB) GetMarkersForVideo(videoId string) ([]datatypes.MarkerData, error) {
	allMarkers, err := jsdb.loadMarkers()
	if err != nil {
		return nil, err
	}
	return allMarkers[videoId], nil
}

// InsertMarker adds a new marker to a video ID
func (jsdb *JsonDB) InsertMarker(videoId string, markerData datatypes.MarkerData) error {
	allMarkers, err := jsdb.loadMarkers()
	if err != nil {
		allMarkers = make(map[string][]datatypes.MarkerData)
	}
	allMarkers[videoId] = append(allMarkers[videoId], markerData)
	return jsdb.saveMarkers(allMarkers)
}

// RemoveAllMarkersFromVideo removes all markers for a video ID
func (jsdb *JsonDB) DeleteMarkersForVideo(videoId string) error {
	allMarkers, err := jsdb.loadMarkers()
	if err != nil {
		return err
	}
	delete(allMarkers, videoId)
	return jsdb.saveMarkers(allMarkers)
}
