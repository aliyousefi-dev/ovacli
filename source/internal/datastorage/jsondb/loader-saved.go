package jsondb

import (
	"encoding/json"
	"os"
)

// LoadCollection reads the account ID to video IDs mapping.
// Returns map[string][]string where key is AccountID and value is slice of VideoIDs.
func (jsdb *JsonDB) LoadSavedCollection() (map[string][]string, error) {
	path := jsdb.getSavedCollectionFilePath() // Assuming you have a method to get the file path

	// Ensure the file exists with "{}" if missing to avoid EOF errors
	if err := jsdb.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Map: Key = AccountID (String), Value = VideoIDs (Slice of Strings)
	var data map[string][]string
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&data); err != nil {
		// If file is empty or corrupted, return an empty map
		return make(map[string][]string), nil
	}

	return data, nil
}

// SaveCollection writes the account ID to video IDs mapping to a JSON file.
func (jsdb *JsonDB) SaveSavedCollection(accountVideos map[string][]string) error {
	path := jsdb.getSavedCollectionFilePath() // Assuming you have a method to get the file path

	// Marshal the map[string][]string into the JSON structure
	data, err := json.MarshalIndent(accountVideos, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}
