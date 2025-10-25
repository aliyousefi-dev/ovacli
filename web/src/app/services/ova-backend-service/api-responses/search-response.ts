import { VideoData } from '../api-types/video-data';

export interface SearchResponse {
  query: string;
  results: VideoData[];
  totalCount: number;
}
