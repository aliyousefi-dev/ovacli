package repo

import (
	"fmt"
	"os"
)

func (r *RepoManager) RemoveVideo(videoId string) error {
	if !r.IsDataStorageInitialized() {
		return fmt.Errorf("data storage is not initialized")
	}

	// Get the path of the video file
	videoPath, err := r.diskDataStorage.GetVideoLookup(videoId)
	if err != nil {
		fmt.Printf("Warning: could not get video path for videoId %s: %v\n", videoId, err)
	}

	err = r.diskDataStorage.DeleteVideoByID(videoId)
	if err != nil {
		return fmt.Errorf("failed to delete video lookup for videoId %s: %w", videoId, err)
	}

	// If we have the videoPath, attempt to delete the actual video file
	if videoPath != "" {
		err := os.Remove(videoPath)
		if err != nil {
			fmt.Printf("Warning: failed to delete video file at path %s for videoId %s: %v\n", videoPath, videoId, err)
		}
	} else {
		fmt.Printf("Info: no video path found for videoId %s, skipping file deletion.\n", videoId)
	}

	return nil
}
