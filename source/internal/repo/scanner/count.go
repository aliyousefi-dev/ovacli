package scanner

import (
	"fmt"
)

func (s *Scanner) CountVideos() (int, error) {
	videos, err := s.GetVideos()
	if err != nil {
		return 0, fmt.Errorf("failed to count videos: %w", err)
	}

	return len(videos), nil
}

func (r *Scanner) CountDirectories() (int, error) {
	folders, err := r.GetDirectories()
	if err != nil {
		return 0, fmt.Errorf("failed to count directories: %w", err)
	}

	return len(folders), nil
}
