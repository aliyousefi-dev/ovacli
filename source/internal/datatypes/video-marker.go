package datatypes

type VideoMarkerData struct {
	TimeSecond  int    `json:"timeSecond"`  // Time in seconds where the marker is placed
	Title       string `json:"title"`       // Title or description of the marker
	Description string `json:"description"` // Detailed description of the marker
}
