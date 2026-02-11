import { VideoData } from './video-data';

export interface PageContainer {
  videos: VideoData[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}
