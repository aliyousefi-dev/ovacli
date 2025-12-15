package jsondb

import "ova-cli/source/internal/datastorage/datatypes"

func (jsdb *JsonDB) GetTotalMarkerCount() (int, error) {
	allMarkers, err := jsdb.GetAllMarkers()
	if err != nil {
		return 0, err
	}
	count := 0
	for _, markers := range allMarkers {
		count += len(markers)
	}
	return count, nil
}

// ClearAllMarkers removes all markers
func (jsdb *JsonDB) ClearAllMarkers() error {
	return jsdb.saveMarkers(make(map[string][]datatypes.VideoMarkerData))
}
