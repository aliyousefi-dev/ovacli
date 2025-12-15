package jsondb

import "errors"

var (
	ErrMarkerNotFound    = errors.New("marker not found")
	ErrVideoRateNotFound = errors.New("video rate not found")
	ErrVideoNotFound     = errors.New("video not found")
)
