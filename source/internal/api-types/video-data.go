package apitypes

import (
	"ova-cli/source/internal/datatypes"
	"time"
)

// Define a new struct for video status
type UserVideoStatus struct {
	IsWatched bool `json:"isWatched"`
	IsSaved   bool `json:"isSaved"`
}

type VideoDataAPIResponse struct {
	VideoID              string                `json:"videoId"`
	FileName             string                `json:"fileName"`
	Tags                 []string              `json:"tags"`
	Codecs               datatypes.VideoCodecs `json:"codecs"`
	IsCooked             bool                  `json:"isCooked"`
	OwnerAccountUsername string                `json:"ownerAccountUsername"`
	TotalViews           int                   `json:"totalViews"`
	TotalDownloads       int                   `json:"totalDownloads"`
	IsPublic             bool                  `json:"isPublic"`
	UploadedAt           time.Time             `json:"uploadedAt"`
	VideoStatus          UserVideoStatus       `json:"userVideoStatus"` // New field
}
