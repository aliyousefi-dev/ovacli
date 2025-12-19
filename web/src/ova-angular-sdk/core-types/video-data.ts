import { VideoMarker } from './video-marker';

export interface VideoCodecs {
  format: string; // Video file extension (e.g., ".mp4")
  durationSec: number; // Video duration in seconds
  frameRate: number; // Frames per second
  isFragment: boolean; // Check if it's fragmented or not
  resolution: Resolution;
  videoCodec: string; // Video codec (e.g., "avc1.64001F")
  audioCodec: string; // Audio codec (e.g., "mp4a.40.2")
}

export interface Resolution {
  width: number; // Width of the video
  height: number; // Height of the video
}

export interface userVideoStatus {
  isWatched: boolean;
  isSaved: boolean;
}

export interface VideoData {
  videoId: string; // Unique video ID (e.g., "087be485e0acad6fb1ba026e75542fed5f52e073496c649bc4a3ce345a63f48f")
  fileName: string; // Name of the video file without extension (e.g., "pexels-sosa-films-5656141")
  tags: string[]; // Tags associated with the video
  uploadedAt: string; // ISO 8601 date string when the video was uploaded (e.g., "2025-10-18T16:08:28.7528704Z")
  totalDownloads: number; // Total number of downloads
  codecs: VideoCodecs; // Codec details for the video
  markers: VideoMarker[]; // Array of marker data
  isCooked: boolean; // Indicates if the video is processed (cooked)
  ownerAccountUsername: string; // Username of the owner account (can be an empty string if not set)
  totalViews: number; // Total number of views for the video
  isPublic: boolean; // Whether the video is public or not
  userVideoStatus: userVideoStatus;
}
