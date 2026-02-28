package jsondb

import (
	"encoding/json"
	"os"
	"ova-cli/source/internal/datatypes"
)

func (jsdb *JsonDB) LoadPlaylistCollection() (map[string]datatypes.PlaylistData, error) {
	path := jsdb.getPlaylistCollectionFilePath()

	// Ensure the file exists with "{}" if missing to avoid EOF errors
	if err := jsdb.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var data map[string]datatypes.PlaylistData
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&data); err != nil {
		return make(map[string]datatypes.PlaylistData), nil
	}

	return data, nil
}

func (jsdb *JsonDB) SavePlaylistCollection(playlistsData map[string]datatypes.PlaylistData) error {
	path := jsdb.getPlaylistCollectionFilePath()

	data, err := json.MarshalIndent(playlistsData, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}
