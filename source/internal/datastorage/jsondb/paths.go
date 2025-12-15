package jsondb

import "path/filepath"

func (s *JsonDB) getUserDataFilePath() string {
	return filepath.Join(s.storageDir, "users.json")
}

func (s *JsonDB) getVideoDataFilePath() string {
	return filepath.Join(s.storageDir, "videos.json")
}

func (s *JsonDB) getVideoMarkerDataFilePath() string {
	return filepath.Join(s.storageDir, "video-markers.json")
}

func (s *JsonDB) getSpaceDataFilePath() string {
	return filepath.Join(s.storageDir, "spaces.json")
}

func (s *JsonDB) getWatchedDataFilePath() string {
	return filepath.Join(s.storageDir, "watched.json")
}

func (s *JsonDB) getVideoRatesDataFilePath() string {
	return filepath.Join(s.storageDir, "video-rates.json")
}
