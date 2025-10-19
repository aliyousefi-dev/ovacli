package repo

import (
	"os"
)

// GetExecutableFolderPath returns the folder path of the currently running executable (ovacli).
func (r *RepoManager) CreateFolder(folderPath string) error {
	err := os.MkdirAll(folderPath, os.ModePerm)
	if err != nil {
		return err
	}
	return nil
}
