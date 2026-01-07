package jsondb

import (
	"fmt" // os is not directly used in the provided functions, but good to keep if used elsewhere in the package.
	"ova-cli/source/internal/datatypes"
	"sort"
)

// AddVideo adds a new video if it does not already exist.
// Returns an error if a video with the same ID already exists.
func (s *JsonDB) AddVideo(video datatypes.VideoData) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	if _, exists := videos[video.VideoID]; exists {
		return fmt.Errorf("video with ID %q already exists", video.VideoID)
	}

	videos[video.VideoID] = video
	return s.saveVideos(videos)
}

// DeleteVideo removes a video by its ID.
// If the video does not exist, it's considered a no-op (no error is returned).
func (s *JsonDB) DeleteVideoByID(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	// The delete operation is safe even if the key doesn't exist.
	delete(videos, id)
	return s.saveVideos(videos)
}

// GetVideoByID finds a video by its ID.
// Returns a pointer to VideoData if found, or an error if the video does not exist.
func (s *JsonDB) GetVideoByID(id string) (*datatypes.VideoData, error) {
	s.mu.Lock() // Added lock for read operation, consistency with other methods
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	video, found := videos[id]
	if !found {
		return nil, fmt.Errorf("video %q not found", id)
	}
	// Return a pointer to a copy of the video data from the map.
	// This prevents external modification of the map's internal data without going through the setter.
	return &video, nil
}

// UpdateVideo replaces an existing video with the provided new video data.
// Returns an error if the video to be updated does not exist.
func (s *JsonDB) UpdateVideo(newVideo datatypes.VideoData) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return fmt.Errorf("failed to load videos: %w", err)
	}

	if _, exists := videos[newVideo.VideoID]; !exists {
		return fmt.Errorf("video %q not found for update", newVideo.VideoID)
	}

	videos[newVideo.VideoID] = newVideo
	return s.saveVideos(videos)
}

// GetAllVideos returns all videos currently in storage as a slice.
func (s *JsonDB) GetAllVideos() ([]datatypes.VideoData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	videosMap, err := s.loadVideos()
	if err != nil {
		return nil, fmt.Errorf("failed to load videos: %w", err)
	}

	// Convert map to slice
	videos := make([]datatypes.VideoData, 0, len(videosMap))
	for _, video := range videosMap {
		videos = append(videos, video)
	}

	// Sort videos by UploadedAt timestamp
	sort.Slice(videos, func(i, j int) bool {
		return videos[i].UploadedAt.After(videos[j].UploadedAt)
	})

	return videos, nil
}

// DeleteAllVideos removes all videos from storage.
func (s *JsonDB) DeleteAllVideos() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Clear all videos by resetting the map
	videos := make(map[string]datatypes.VideoData)

	return s.saveVideos(videos)
}

func (s *JsonDB) GetTotalVideoCount() (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	videos, err := s.loadVideos()
	if err != nil {
		return 0, fmt.Errorf("failed to load videos: %w", err)
	}
	return len(videos), nil
}
