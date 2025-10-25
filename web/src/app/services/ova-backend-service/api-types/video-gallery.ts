import { VideoData } from './video-data';

export interface VideoGallery {
  videos: VideoData[]; // Array of video data
  totalVideos: number; // Total number of videos cached
  currentBucket: number; // The current bucket requested
  bucketContentSize: number; // Size of each bucket (fixed to 20)
  totalBuckets: number; // Total number of buckets
}
