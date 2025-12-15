package datastorage

import (
	"fmt"
	"ova-cli/source/internal/datastorage/jsondb"
	"ova-cli/source/internal/datastorage/sessiondb"
)

// NewDiskStorage creates a new storage backend instance based on the given type.
// storageType can be "jsondb" or "boltdb".
// storagePath is the base path to store the data.
func NewDiskStorage(storageType, dataStoragePath string) (DiskDataStorage, error) {
	switch storageType {
	case "jsondb":
		return jsondb.NewJsonDB(dataStoragePath), nil
	default:
		return nil, fmt.Errorf("unknown storage type: %s", storageType)
	}
}

func NewSessionStorage(dataStoragePath string) (SessionDataStorage, error) {
	return sessiondb.NewSessionDB(dataStoragePath), nil
}
