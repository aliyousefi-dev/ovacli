package apitypes

// VideoBucketResponse represents the structure of the response for the latest videos.
type VideoBucketResponse struct {
	VideoIDs          []string `json:"videoIds"`
	TotalVideos       int      `json:"totalVideos"`
	CurrentBucket     int      `json:"currentBucket"`
	BucketContentSize int      `json:"bucketContentSize"`
	TotalBuckets      int      `json:"totalBuckets"`
}
