package datatypes

type GlobalFilter struct {
	Name  string `json:"name"`  // Title or description of the marker
	Query string `json:"query"` // Detailed description of the marker
}
