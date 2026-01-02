package jsondb

import "ova-cli/source/internal/datatypes"

// InsertVideoLookup updates or inserts the physical location of a video in the lookup table.
func (jsdb *JsonDB) InsertVideoLookup(videoID string, lookupData datatypes.VideoLookup) error {
	// 1. Load the existing lookup map
	allLookups, err := jsdb.LoadLookupCollection()
	if err != nil {
		return err
	}

	// 2. Set the location (This performs an "Upsert" - Update or Insert)
	// We don't use append() because one VideoID maps to exactly one FilePath
	allLookups[videoID] = lookupData

	// 3. Save the updated map back to lookup.json
	return jsdb.SaveLookupCollection(allLookups)
}

// GetVideoLookup retrieves the location data for a specific video ID.
// Returns the data, a boolean (true if found), and any error.
func (jsdb *JsonDB) GetVideoLookup(videoID string) (datatypes.VideoLookup, bool, error) {
	allLookups, err := jsdb.LoadLookupCollection()
	if err != nil {
		return datatypes.VideoLookup{}, false, err
	}

	lookup, exists := allLookups[videoID]
	return lookup, exists, nil
}

// DeleteVideoLookup removes a video's location record from the lookup table.
func (jsdb *JsonDB) DeleteVideoLookup(videoID string) error {
	allLookups, err := jsdb.LoadLookupCollection()
	if err != nil {
		return err
	}

	// Check if it exists before trying to delete to save a redundant write
	if _, exists := allLookups[videoID]; !exists {
		return nil // Already gone, no error
	}

	// Remove from the map
	delete(allLookups, videoID)

	// Save the updated map
	return jsdb.SaveLookupCollection(allLookups)
}
