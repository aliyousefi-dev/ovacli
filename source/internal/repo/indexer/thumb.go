package indexer

import (
	"fmt"
	"ova-cli/source/internal/thirdparty"
)

func (s *Indexer) generateThumbnail(videoPath string) error {

	if err := thirdparty.GenerateImageFromVideo(videoPath, "output.jpg", 50); err != nil {
		return fmt.Errorf("failed to generate thumbnail for %s: %w", videoPath, err)
	}

	return nil
}
