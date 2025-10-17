# Bucket Fetch

This feature on the api lets you to fetch a bucket of data. with this feature you can get a list of videos from a specific bucket. It enables you to implement pagination or infinite scrolling.

---

## Data Structure

Here is a snapshot of bucket fetch data:

```
{
  "data": {
    "bucketContentSize": 15,
    "currentBucket": 1,
    "totalBuckets": 41,
    "totalVideos": 610,
    "videoIds": [
      "e9a82f95729c2c4d244dafb67c7964d390878ce4ff7388092741e9774b2bac5a"
    ]
  },
  "message": "Latest videos retrieved successfully",
  "status": "success"
}
```
