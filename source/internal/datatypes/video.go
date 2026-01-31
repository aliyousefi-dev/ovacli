package datatypes

import (
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
	Title          string      `json:"title"`
	VideoID        string      `json:"videoId"`        // Unique identifier for the
	Tags           []string    `json:"tags"`           // Tags for categorization and search
	Codecs         VideoCodecs `json:"codecs"`         // Codec information
	IsCooked       bool        `json:"isCooked"`       // Indicates if the video is processed (cooked)
	UploaderID     string      `json:"uploaderId"`     // ID of the owner account
	TotalViews     int         `json:"totalViews"`     // Total number of views
	TotalDownloads int         `json:"totalDownloads"` // Total number of downloads
	IsPublic       bool        `json:"isPublic"`       // Indicates if the video is public
	UploadedAt     time.Time   `json:"uploadedAt"`     // Timestamp of upload
}

// NewVideoData returns an initialized VideoData struct.
// Renamed for clarity and added 'Description' field.
func NewVideoData(title string, videoID string) VideoData {
	return VideoData{
		Title:          title,
		VideoID:        videoID,
		IsCooked:       true,
		Tags:           []string{},
		UploaderID:     "",
		TotalViews:     0,
		TotalDownloads: 0,
		IsPublic:       true,
		UploadedAt:     time.Now().UTC(),
		Codecs:         VideoCodecs{}, // zero value
	}
}
