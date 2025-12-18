package apitypes

type MarkerDataRequest struct {
	TimeSecond  int    `json:"timeSecond" binding:"required"`
	Label       string `json:"label" binding:"required"`
	Description string `json:"description"`
}
