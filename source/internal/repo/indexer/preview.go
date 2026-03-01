package indexer

import (
	"fmt"
	"ova-cli/source/internal/thirdparty"
)

func (s *Indexer) generatePreview(videoPath string) error {

	if err := thirdparty.GenerateImageFromVideo(videoPath, "output.webm", 50); err != nil {
		return fmt.Errorf("failed to generate thumbnail for %s: %w", videoPath, err)
	}

	return nil
}
