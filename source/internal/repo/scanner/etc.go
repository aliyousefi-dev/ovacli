package scanner

import (
	"ova-cli/source/internal/datatypes"
)

func (s *Scanner) GetAllIndexedVideos() ([]datatypes.VideoData, error) {

	return s.diskDataStorage.GetAllVideos()
}
