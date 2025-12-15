package jsondb

import "sync"

type JsonDB struct {
	mu         sync.Mutex
	storageDir string
}

func NewJsonDB(storageDir string) *JsonDB {
	return &JsonDB{storageDir: storageDir}
}
