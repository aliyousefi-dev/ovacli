package jsondb

import (
	"encoding/json"
	"os"
)

// Load all videos (assuming videos stored in a map with userID as key)
func (s *JsonDB) loadWatched() (map[string][]string, error) {
	path := s.getWatchedDataFilePath()

	// Ensure file exists with "{}" if missing
	if err := s.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Change the type of the map to store a slice of strings (video IDs)
	var videos map[string][]string
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&videos); err != nil {
		return nil, err
	}
	return videos, nil
}

// Save all videos (assuming videos stored in a map with userID as key)
func (s *JsonDB) saveWatched(videos map[string][]string) error {
	// Marshal the data with indentation for readability
	data, err := json.MarshalIndent(videos, "", "  ")
	if err != nil {
		return err
	}

	// Save the marshaled data to the file
	return os.WriteFile(s.getWatchedDataFilePath(), data, 0644)
}
