package scanner

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func (r *Scanner) GetDirectories() ([]string, error) {
	var folders []string

	err := filepath.Walk(r.rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // skip errors
		}

		if info.IsDir() {
			// We use filepath.Rel just for the logic of filtering folders
			rel, relErr := filepath.Rel(r.rootDir, path)
			if relErr != nil {
				return nil
			}

			// 1. Skip .ova-repo and its subfolders
			if rel == ".ova-repo" || strings.HasPrefix(rel, ".ova-repo"+string(os.PathSeparator)) {
				return filepath.SkipDir
			}

			// 2. Skip hidden folders (names starting with dot)
			if rel != "." && strings.HasPrefix(info.Name(), ".") {
				return filepath.SkipDir
			}

			// 3. Skip the root directory itself, but append the full path for everything else
			if rel != "." {
				// Convert to Linux-style "/" at the very end
				normalizedPath := filepath.ToSlash(path)
				folders = append(folders, normalizedPath)
			}
		}
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to get folders: %w", err)
	}

	return folders, nil
}
