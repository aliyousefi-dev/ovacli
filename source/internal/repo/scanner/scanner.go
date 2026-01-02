package scanner

import "path/filepath"

type Scanner struct {
	rootDir         string
	VideoExtensions []string
}

func NewScanner(rootDir string) (*Scanner, error) {
	scanner := &Scanner{
		rootDir:         filepath.ToSlash(rootDir),
		VideoExtensions: []string{".mp4"},
	}

	return scanner, nil
}
