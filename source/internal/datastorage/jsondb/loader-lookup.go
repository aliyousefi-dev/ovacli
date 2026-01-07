package jsondb

import (
	"encoding/json"
	"os"
)

// LoadLookupCollection reads the video-to-path mapping.
// Now returns map[string]string for the flat format: {"hash": "path"}
func (jsdb *JsonDB) LoadLookupCollection() (map[string]string, error) {
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

	// Map: Key = VideoID (Hash), Value = FilePath (String)
	var data map[string]string
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&data); err != nil {
		// If file is empty or corrupted, return an empty map
		return make(map[string]string), nil
	}

	return data, nil
}

// SaveLookupCollection writes the flat mapping to lookup.json
func (jsdb *JsonDB) SaveLookupCollection(lookupMap map[string]string) error {
	path := jsdb.getLookupCollectionFilePath()

	// Marshal the map[string]string into the flat JSON structure
	data, err := json.MarshalIndent(lookupMap, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}
