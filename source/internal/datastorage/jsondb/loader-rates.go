package jsondb

import (
	"encoding/json"
	"os"
	"ova-cli/source/internal/datastorage/datatypes"
)

// Load video marker data for all videos (assuming the data is stored in a map with videoID as key, value as array of markers)
func (jsdb *JsonDB) loadRates() (map[string][]datatypes.VideoMarkerData, error) {
	path := jsdb.getVideoMarkerDataFilePath()

	// Ensure the file exists with "{}" if missing
	if err := jsdb.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// A map where video ID is the key, and an array of VideoMarkerData is the value
	var markers map[string][]datatypes.VideoMarkerData
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&markers); err != nil {
		return nil, err
	}

	return markers, nil
}

// Save video marker data (assuming the data is a map with videoID as the key and array of markers as value)
func (jsdb *JsonDB) saveRates(markers map[string][]datatypes.VideoMarkerData) error {
	data, err := json.MarshalIndent(markers, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(jsdb.getVideoMarkerDataFilePath(), data, 0644)
}
