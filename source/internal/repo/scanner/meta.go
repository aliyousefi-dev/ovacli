package scanner

import (
	"fmt"
	"ova-cli/source/internal/thirdparty"
)

// GetVideoMetadata extracts technical details from a specific video file.
func (r *Scanner) GetVideoMetadata(videoPath string) (VideoMetadata, error) {
	// Calling your thirdparty wrapper
	details, err := thirdparty.GetVideoDetails(videoPath)
	if err != nil {
		return VideoMetadata{}, fmt.Errorf("failed to get metadata for file %s: %w", videoPath, err)
	}

	// Map the thirdparty result to your internal Metadata struct
	return VideoMetadata{
		Format:      details.Format,
		DurationSec: int(details.DurationSec),
		FrameRate:   details.FrameRate,
		IsFragment:  details.IsFragment,
		Resolution: VideoResolution{
			Width:  details.Resolution.Width,
			Height: details.Resolution.Height,
		},
		VideoCodec: details.VideoCodec,
		AudioCodec: details.AudioCodec,
	}, nil
}
