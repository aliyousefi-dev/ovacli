import { VideoMarker } from './video-marker';

export interface VideoCodecs {
  format: string;
  durationSec: number;
  frameRate: number;
  isFragment: boolean;
  resolution: Resolution;
  videoCodec: string;
  audioCodec: string;
}

export interface Resolution {
  width: number;
  height: number;
}

export interface userVideoStatus {
  isWatched: boolean;
  isSaved: boolean;
}

export interface VideoStats {
  views: string;
  downloads: string;
}

export interface VideoData {
  videoId: string;
  title: string;
  tags: string[];
  uploadedAt: string;
  stats: VideoStats;
  codecs: VideoCodecs;
  isCooked: boolean;
  uploaderId: string;
  isPublic: boolean;
}
