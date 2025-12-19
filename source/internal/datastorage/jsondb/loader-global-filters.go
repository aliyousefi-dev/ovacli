package jsondb

import (
	"encoding/json"
	"os"
	"ova-cli/source/internal/datastorage/datatypes"
)

// loadGlobalFilters retrieves the global filters from the JSON file.
func (s *JsonDB) loadGlobalFilters() ([]datatypes.GlobalFilter, error) {
	// Get the path to the global filters data file
	path := s.getGlobalFiltersDataFilePath()

	// Ensure the file exists, create it with "[]" if it doesn't
	if err := s.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
	}

	// Open the file
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Initialize a slice to hold the filters data
	var filters []datatypes.GlobalFilter
	decoder := json.NewDecoder(file)

	// Decode the JSON into the filters slice
	if err := decoder.Decode(&filters); err != nil {
		return nil, err
	}

	return filters, nil
}

// saveGlobalFilters saves the provided global filters to the JSON file.
func (s *JsonDB) saveGlobalFilters(filters []datatypes.GlobalFilter) error {
	// Marshal the filters to JSON with indentation for readability
	data, err := json.MarshalIndent(filters, "", "  ")
	if err != nil {
		return err
	}

	// Write the marshaled data to the file
	return os.WriteFile(s.getGlobalFiltersDataFilePath(), data, 0644)
}
