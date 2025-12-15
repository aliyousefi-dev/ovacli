package sessiondb

import "sync"

type SessionDB struct {

	// session id -> username
	SessionIDs map[string]string
	storageDir string

	mu sync.RWMutex
}

func NewSessionDB(storageDir string) *SessionDB {
	return &SessionDB{
		SessionIDs: make(map[string]string),
		storageDir: storageDir,
	}
}
