package jsondb

import (
	"fmt"
	"path/filepath"
)

// InsertVideoLookup updates or inserts the physical location of a video in the lookup table.
// Now accepts videoID and filePath directly as strings.
func (jsdb *JsonDB) InsertVideoLookup(videoId string, path string) error {
	// 1. Load the existing lookup map (now map[string]string)
	allLookups, err := jsdb.LoadLookupCollection()
	if err != nil {
		return err
	}

	// 2. Set the location
	allLookups[videoId] = filepath.ToSlash(path)

	// 3. Save the updated map back to lookup.json
	return jsdb.SaveLookupCollection(allLookups)
}

// GetVideoLookup retrieves the location path for a specific video ID.
// Returns the path string, a boolean (true if found), and any error.
func (jsdb *JsonDB) GetVideoLookup(videoId string) (string, error) {
	allLookups, err := jsdb.LoadLookupCollection()
	if err != nil {
		return "", err
	}

	path, exists := allLookups[videoId]
	if !exists {
		// Return a formatted error including the missing ID
		return "", fmt.Errorf("video lookup failed: ID %s not found in index", videoId)
	}

	return path, nil
}

// DeleteVideoLookup removes a video's location record from the lookup table.
func (jsdb *JsonDB) DeleteVideoLookup(videoId string) error {
	allLookups, err := jsdb.LoadLookupCollection()
	if err != nil {
		return err
	}

	// Check if it exists before trying to delete to save a redundant write
	if _, exists := allLookups[videoId]; !exists {
		return nil // Already gone, no error
	}

	// Remove from the map
	delete(allLookups, videoId)

	// Save the updated map
	return jsdb.SaveLookupCollection(allLookups)
}
