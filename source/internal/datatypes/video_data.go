package datatypes

import (
	"path/filepath"
	"strings"
	"time"
)

// VideoCodecs holds the full format (container + mime type) and separated video/audio codec strings.
type VideoCodecs struct {
	Format      string          `json:"format"`      // Video File Extension
	DurationSec int             `json:"durationSec"` // Video duration in seconds
	FrameRate   float64         `json:"frameRate"`   // Frames per second
	IsFragment  bool            `json:"isFragment"`  // Check if it's fragmented or not
	Resolution  VideoResolution `json:"resolution"`  // Resolution (width x height)
	VideoCodec  string          `json:"videoCodec"`  // Video codec (e.g., avc1.640032)
	AudioCodec  string          `json:"audioCodec"`  // Audio codec (e.g., mp4a.40.2)
}

// VideoResolution defines the width and height of a video.
type VideoResolution struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

// VideoData represents a single video entry.
type VideoData struct {
	VideoID        string      `json:"videoId"`        // Unique identifier for the
	FilePath       string      `json:"filePath"`       // Path to the video file
	Tags           []string    `json:"tags"`           // Tags for categorization and search
	Codecs         VideoCodecs `json:"codecs"`         // Codec information
	IsCooked       bool        `json:"isCooked"`       // Indicates if the video is processed (cooked)
	OwnerAccountId string      `json:"ownerAccountId"` // ID of the owner account
	TotalViews     int         `json:"totalViews"`     // Total number of views
	TotalDownloads int         `json:"totalDownloads"` // Total number of downloads
	IsPublic       bool        `json:"isPublic"`       // Indicates if the video is public
	UploadedAt     time.Time   `json:"uploadedAt"`     // Timestamp of upload
}

type VideoDataAPIResponse struct {
	VideoID              string      `json:"videoId"`
	FileName             string      `json:"fileName"`
	Tags                 []string    `json:"tags"`
	Codecs               VideoCodecs `json:"codecs"`
	IsCooked             bool        `json:"isCooked"`
	OwnerAccountUsername string      `json:"ownerAccountUsername"`
	TotalViews           int         `json:"totalViews"`
	TotalDownloads       int         `json:"totalDownloads"`
	IsPublic             bool        `json:"isPublic"`
	UploadedAt           time.Time   `json:"uploadedAt"`
}

// NewVideoData returns an initialized VideoData struct.
// Renamed for clarity and added 'Description' field.
func NewVideoData(videoID string) VideoData {
	return VideoData{
		VideoID:        videoID,
		FilePath:       "",
		IsCooked:       true,
		Tags:           []string{},
		OwnerAccountId: "",
		TotalViews:     0,
		TotalDownloads: 0,
		IsPublic:       true,
		UploadedAt:     time.Now().UTC(),
		Codecs:         VideoCodecs{}, // zero value
	}
}

func (vd *VideoData) GetFileName() string {
	return strings.TrimSuffix(filepath.Base(vd.FilePath), filepath.Ext(vd.FilePath))
}

func (vd *VideoData) SetFilePath(path string) {
	vd.FilePath = filepath.ToSlash(path)
}
