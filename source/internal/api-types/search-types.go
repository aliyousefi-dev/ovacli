package apitypes

type SearchCriteria struct {
	Query string   `json:"query"` // The main search string
	Tags  []string `json:"tags"`  // Tags used for filtering
}

// SearchRequest represents the structure of the incoming search request.
type SearchRequest struct {
	Query       string   `json:"query"`
	Tags        []string `json:"tags"`
	MinRating   float64  `json:"minRating"`
	MaxDuration int      `json:"maxDuration"`
}

type SearchResponse struct {
	Criteria SearchCriteria      `json:"criteria"`
	Result   VideoBucketResponse `json:"result"` // Use VideoBucketResponse for paginated results
}
