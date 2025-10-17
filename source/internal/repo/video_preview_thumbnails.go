package repo

import (
	"fmt"
	"os"
	"ova-cli/source/internal/thirdparty"
	"path/filepath"
)

func (r *RepoManager) CheckPreviewThumbnailGenerated(videoID string) bool {
	// Check if the preview thumbnail exists
	videoSpriteDir := r.GetPreviewThumbnailsFolderPathByVideoID(videoID)
	vttPath := filepath.Join(videoSpriteDir, "thumbnails.vtt")
	if _, err := os.Stat(vttPath); err == nil {
		// Preview thumbnail exists
		return true
	}
	// Preview thumbnail does not exist
	return false
}

// GenerateVideoPreviewThumbnails generates sprite sheet thumbnails and VTT files for a single video.
func (r *RepoManager) GenerateVideoPreviewThumbnails(videoPath string) error {
	// Use existing method to generate unique video ID (content hash)
	videoID, err := r.GenerateVideoID(videoPath)
	if err != nil {
		return fmt.Errorf("failed to compute video ID: %w", err)
	}

	// Use GetStoryboardFolderPathByVideoID to get the folder path for the storyboard
	videoSpriteDir := r.GetPreviewThumbnailsFolderPathByVideoID(videoID)

	// Create the storyboard directory if it doesn't exist
	if err := os.MkdirAll(videoSpriteDir, 0755); err != nil {
		return fmt.Errorf("failed to create directory for %s: %w", filepath.Base(videoPath), err)
	}

	vttPath := filepath.Join(videoSpriteDir, "thumbnails.vtt")
	if _, err := os.Stat(vttPath); err == nil {
		return fmt.Errorf("thumbnails.vtt already exists, skipping %s", filepath.Base(videoPath))
	}

	keyframeDir := filepath.Join(videoSpriteDir, "keyframes")
	if err := os.MkdirAll(keyframeDir, 0755); err != nil {
		return fmt.Errorf("failed to create keyframe dir for %s: %w", filepath.Base(videoPath), err)
	}

	if err := thirdparty.ExtractKeyframes(videoPath, keyframeDir, 160, 90); err != nil {
		return fmt.Errorf("keyframe extraction error for %s: %w", filepath.Base(videoPath), err)
	}

	spritePattern := filepath.Join(videoSpriteDir, "thumb_L0_%03d.jpg")
	if err := thirdparty.GenerateSpriteSheetsFromFolder(keyframeDir, spritePattern, "5x5", 160, 90); err != nil {
		return fmt.Errorf("sprite generation error for %s: %w", filepath.Base(videoPath), err)
	}

	keyframeTimes, err := thirdparty.GetKeyframePacketTimestamps(videoPath)
	if err != nil {
		return fmt.Errorf("failed to get keyframe timestamps for %s: %w", filepath.Base(videoPath), err)
	}
	if len(keyframeTimes) == 0 {
		return fmt.Errorf("no keyframes found for %s", filepath.Base(videoPath))
	}

	vttPattern := filepath.Join("/api/v1/preview-thumbnails", videoID, "thumb_L0_%03d.jpg")
	if err := thirdparty.GenerateVTT(keyframeTimes, "5x5", 160, 90, vttPattern, vttPath, ""); err != nil {
		return fmt.Errorf("VTT generation error for %s: %w", filepath.Base(videoPath), err)
	}

	// Clean up keyframes folder
	if err := os.RemoveAll(keyframeDir); err != nil {
		// Log but don’t fail
		fmt.Printf("Warning: failed to delete keyframe dir for %s: %v\n", filepath.Base(videoPath), err)
	}

	return nil
}
