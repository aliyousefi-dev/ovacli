package datastorage

import (
	"fmt"
	"ova-cli/source/internal/datastorage/jsondb"
	"ova-cli/source/internal/datastorage/sessiondb"
)

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
