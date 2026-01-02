package scanner

import (
	"fmt"
	"os"
	"path/filepath"
)

func (s *Scanner) GetTotalSize() (SizeResult, error) {
	var totalSize int64

	err := filepath.WalkDir(s.rootDir, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}

		if d.IsDir() && d.Name() == ".ova-repo" {
			return filepath.SkipDir
		}

		if !d.IsDir() {
			info, err := d.Info()
			if err == nil {
				totalSize += info.Size()
			}
		}
		return nil
	})

	// Calculate Human Readable Size (GB)
	// 1 GB = 1024 * 1024 * 1024 bytes
	gb := float64(totalSize) / (1024 * 1024 * 1024)
	humanReadable := fmt.Sprintf("%.2f GB", gb)

	return SizeResult{
		Bytes: totalSize,
		Human: humanReadable,
	}, err
}
