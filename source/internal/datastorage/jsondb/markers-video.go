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

func (jsdb *JsonDB) RemoveMarker(videoId string, timeSeconds int) error {
	allMarkers, err := jsdb.loadMarkers()
	if err != nil {
		return err
	}

	// If no markers exist for the video, nothing to remove
	markers, ok := allMarkers[videoId]
	if !ok || len(markers) == 0 {
		return nil
	}

	// Filter out the marker with matching timestamp
	newList := make([]datatypes.MarkerData, 0, len(markers))
	for _, m := range markers {
		if m.TimeSecond != timeSeconds {
			newList = append(newList, m)
		}
	}

	// Update the map
	if len(newList) == 0 {
		delete(allMarkers, videoId)
	} else {
		allMarkers[videoId] = newList
	}

	return jsdb.saveMarkers(allMarkers)
}
