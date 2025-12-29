package jsondb

import (
	"encoding/json"
	"os"
	"ova-cli/source/internal/datatypes"
)

// Load all videos (assuming videos stored in a map)
func (s *JsonDB) loadVideos() (map[string]datatypes.VideoData, error) {
	path := s.getVideoDataFilePath()

	// Ensure file exists with "{}" if missing
	if err := s.createEmptyJSONFileIfMissing(path); err != nil {
		return nil, err
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var videos map[string]datatypes.VideoData
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&videos); err != nil {
		return nil, err
	}
	return videos, nil
}

// Save all videos
func (s *JsonDB) saveVideos(videos map[string]datatypes.VideoData) error {
	data, err := json.MarshalIndent(videos, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.getVideoDataFilePath(), data, 0644)
}
