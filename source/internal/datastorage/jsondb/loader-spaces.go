package jsondb

import (
	"encoding/json"
	"os"
	"ova-cli/source/internal/datatypes"
)

func (s *JsonDB) loadSpaces() (map[string]datatypes.SpaceData, error) {
	path := s.getSpaceDataFilePath()

	// Ensure file exists with "{}" if missing
	if err := s.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var spaces map[string]datatypes.SpaceData
	if err := json.Unmarshal(data, &spaces); err != nil {
		return nil, err
	}
	return spaces, nil
}

func (s *JsonDB) saveSpaces(spaces map[string]datatypes.SpaceData) error {
	data, err := json.MarshalIndent(spaces, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.getSpaceDataFilePath(), data, 0644)
}
