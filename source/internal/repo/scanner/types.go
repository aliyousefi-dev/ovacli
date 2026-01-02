package scanner

type SizeResult struct {
	Bytes int64  `json:"bytes"`
	Human string `json:"human"`
}

type VideoInfo struct {
	Path     string        `json:"path"`
	Metadata VideoMetadata `json:"metadata"`
}

type VideoResolution struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type VideoMetadata struct {
	Format      string          `json:"format"` // mp4, mkv, etc.
	DurationSec int             `json:"durationSec"`
	FrameRate   float64         `json:"frameRate"`
	IsFragment  bool            `json:"isFragment"`
	Resolution  VideoResolution `json:"resolution"`
	VideoCodec  string          `json:"videoCodec"`
	AudioCodec  string          `json:"audioCodec"`
	SizeBytes   int64           `json:"sizeBytes"`
	SizeHuman   string          `json:"sizeHuman"`
}
