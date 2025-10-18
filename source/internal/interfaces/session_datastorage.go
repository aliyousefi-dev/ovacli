package interfaces

type SessionDataStorage interface {
	AddSession(sessionID string, accountId string) error
	GetSession(sessionID string) (string, error)
	DeleteSession(sessionID string) error
	SaveOnDisk() error
	LoadFromDisk() error
	ClearAllSessions() error
}
