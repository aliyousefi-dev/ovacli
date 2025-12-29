package repo

import (
	"fmt"
	"os"
	"ova-cli/source/internal/datatypes"
)

func (r *RepoManager) CreateDefaultConfigFile() error {
	defaultCfg := r.GetDefaultConfig()
	r.configs = *defaultCfg

	if err := r.SaveRepoConfig(defaultCfg); err != nil {
		return fmt.Errorf("failed to create new config: %w", err)
	}
	return nil
}

// CreateRepoFolder ensures the .ova-repo directory exists
func (r *RepoManager) CreateRepoFolder() error {
	repoPath := r.GetRepoDir()

	if err := os.MkdirAll(repoPath, 0755); err != nil {
		return fmt.Errorf("failed to create .ova-repo directory: %w", err)
	}

	return nil
}

func (r *RepoManager) CreateRepoWithUser(username, password string, useBoltDB bool) error {

	// Repo doesn't exist, create folder and config
	if err := r.CreateRepoFolder(); err != nil {
		return err
	}

	// Set config based on useBoltDB flag
	storageType := "jsondb"
	if useBoltDB {
		storageType = "boltdb"
	}

	userdata := datatypes.NewUserData(username, password)

	// Create default config with desired storage type
	if err := r.CreateDefaultConfigFileWithStorageType(userdata.AccountID, storageType); err != nil {
		return err
	}

	// Initialize repository (loads config and data storage)
	if err := r.InitDataStorage(); err != nil {
		return err
	}

	// Create admin user
	if err := r.CreateUser(&userdata); err != nil {
		return err
	}

	return nil
}
