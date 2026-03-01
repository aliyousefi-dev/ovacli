package scanner

import (
	"ova-cli/source/internal/datastorage"
	"path/filepath"
)

type Scanner struct {
	rootDir         string
	VideoExtensions []string
	diskDataStorage datastorage.DiskDataStorage
}

func NewScanner(rootDir string) (*Scanner, error) {
	scanner := &Scanner{
		rootDir:         filepath.ToSlash(rootDir),
		VideoExtensions: []string{".mp4"},
	}

	return scanner, nil
}
