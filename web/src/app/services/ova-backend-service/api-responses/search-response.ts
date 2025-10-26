import { VideoBucketResponse } from './video-bucket';

export interface SearchResponse {
  criteria: SearchCriteria;
  filters: VideoFilters;
  result: VideoBucketResponse;
}

export interface SearchCriteria {
  query: string;
  tags: string[];
}

export interface VideoFilters {
  sort: string;
  resolution: string;
  minDuration: string;
  maxDuration: string;
  uploadFrom: string;
  uploadTo: string;
}
