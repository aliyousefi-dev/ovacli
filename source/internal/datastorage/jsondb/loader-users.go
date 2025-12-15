package jsondb

import (
	"encoding/json"
	"os"
	"ova-cli/source/internal/datastorage/datatypes"
)

func (s *JsonDB) loadUsers() (map[string]datatypes.UserData, error) {
	path := s.getUserDataFilePath()

	// Ensure file exists with "{}" if missing
	if err := s.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var users map[string]datatypes.UserData
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, err
	}
	return users, nil
}

func (s *JsonDB) saveUsers(users map[string]datatypes.UserData) error {
	data, err := json.MarshalIndent(users, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.getUserDataFilePath(), data, 0644)
}
