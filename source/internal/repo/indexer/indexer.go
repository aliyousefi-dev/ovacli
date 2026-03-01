package indexer

import "path/filepath"

type Indexer struct {
	rootDir string
	queue   []string
}

func NewIndexer(rootDir string) (*Indexer, error) {
	scanner := &Indexer{
		rootDir: filepath.ToSlash(rootDir),
	}

	return scanner, nil
}
