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
type VideoStats struct {
	Views     int `json:"views"`
	Downloads int `json:"downloads"`
}

type VideoDataAPIResponse struct {
	VideoID              string                `json:"videoId"`
	FileName             string                `json:"fileName"`
	Tags                 []string              `json:"tags"`
	Markers              []MarkerDataRequest   `json:"markers"`
	Codecs               datatypes.VideoCodecs `json:"codecs"`
	IsCooked             bool                  `json:"isCooked"`
	OwnerAccountUsername string                `json:"ownerAccountUsername"`
	VideoStats           VideoStats            `json:"stats"`
	IsPublic             bool                  `json:"isPublic"`
	UploadedAt           time.Time             `json:"uploadedAt"`
	VideoStatus          UserVideoStatus       `json:"userVideoStatus"`
}
