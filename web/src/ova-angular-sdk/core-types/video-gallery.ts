import { VideoData } from './video-data';

export interface GalleryContainer {
  videos: VideoData[];
  totalVideos: number;
  currentBucket: number;
  bucketContentSize: number;
  totalBuckets: number;
}
