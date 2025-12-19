package datatypes

type MarkerData struct {
	TimeSecond  int    `json:"timeSecond"`  // Time in seconds where the marker is placed
	Label       string `json:"label"`       // Title or description of the marker
	Description string `json:"description"` // Detailed description of the marker
}
