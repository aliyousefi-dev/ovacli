package apitypes

import (
	"ova-cli/source/internal/datastorage/datatypes"
	"time"
)

// Define a new struct for video status
type UserVideoStatus struct {
	IsWatched bool `json:"isWatched"`
	IsSaved   bool `json:"isSaved"`
}

type MarkerData struct {
	TimeSecond  int    `json:"timeSecond"`  // Time in seconds where the marker is placed
	Title       string `json:"title"`       // Title or description of the marker
	Description string `json:"description"` // Detailed description of the marker
}

type VideoDataAPIResponse struct {
	VideoID              string                `json:"videoId"`
	FileName             string                `json:"fileName"`
	Tags                 []string              `json:"tags"`
	Markers              []MarkerData          `json:"markers"`
	Codecs               datatypes.VideoCodecs `json:"codecs"`
	IsCooked             bool                  `json:"isCooked"`
	OwnerAccountUsername string                `json:"ownerAccountUsername"`
	TotalViews           int                   `json:"totalViews"`
	TotalDownloads       int                   `json:"totalDownloads"`
	IsPublic             bool                  `json:"isPublic"`
	UploadedAt           time.Time             `json:"uploadedAt"`
	VideoStatus          UserVideoStatus       `json:"userVideoStatus"` // New field
}
