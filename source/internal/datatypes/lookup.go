package datatypes

import "time"

type VideoLookup struct {
	VideoID   string    `json:"videoId"`   // The Hash (SHA-256)
	FilePath  string    `json:"filePath"`  // Relative path from repo root
	FileSize  int64     `json:"fileSize"`  // Size in bytes
	LastSeen  time.Time `json:"lastSeen"`  // Last time the indexer confirmed it exists
	IsMissing bool      `json:"isMissing"` // True if record exists but file was not found on last scan
}
