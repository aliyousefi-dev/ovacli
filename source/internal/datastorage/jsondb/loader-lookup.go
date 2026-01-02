package jsondb

import (
	"encoding/json"
	"os"
	"ova-cli/source/internal/datatypes"
)

// LoadLookupCollection reads the video-to-path mapping.
// It uses a simple map[string]datatypes.VideoLookup for O(1) access by VideoID.
func (jsdb *JsonDB) LoadLookupCollection() (map[string]datatypes.VideoLookup, error) {
	path := jsdb.getLookupCollectionFilePath()

	// Ensure the file exists with "{}" if missing to avoid EOF errors
	if err := jsdb.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Map: Key = VideoID (Hash), Value = VideoLookup (Path/Size)
	var data map[string]datatypes.VideoLookup
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&data); err != nil {
		// If file is empty or corrupted, return an empty map instead of failing
		return make(map[string]datatypes.VideoLookup), nil
	}

	return data, nil
}

// SaveLookupCollection writes the current disk mapping to lookup.json
func (jsdb *JsonDB) SaveLookupCollection(lookupMap map[string]datatypes.VideoLookup) error {
	path := jsdb.getLookupCollectionFilePath()

	data, err := json.MarshalIndent(lookupMap, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}
