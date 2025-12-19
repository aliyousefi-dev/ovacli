import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OVASDKConfig } from '../global-config';

import { VideoData } from '../core-types/video-data';
import { ApiSuccessResponse } from './api-types/core-response';
import { SimilarVideosResponse } from './api-types/similar-videos-response';

@Injectable({
  providedIn: 'root',
})
export class VideoApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  getVideosByFolder(folder: string): Observable<ApiSuccessResponse<any>> {
    const params = new URLSearchParams();
    if (folder) {
      params.set('folder', folder);
    }
    return this.http.get<ApiSuccessResponse<any>>(
      `${this.config.apiBaseUrl}/videos?${params.toString()}`,
      { withCredentials: true }
    );
  }

  getVideoById(videoId: string): Observable<ApiSuccessResponse<VideoData>> {
    return this.http.get<ApiSuccessResponse<VideoData>>(
      `${this.config.apiBaseUrl}/videos/${videoId}`,
      { withCredentials: true }
    );
  }

  getVideosByIds(ids: string[]): Observable<ApiSuccessResponse<VideoData[]>> {
    return this.http.post<ApiSuccessResponse<VideoData[]>>(
      `${this.config.apiBaseUrl}/videos/batch`,
      { IDs: ids },
      { withCredentials: true }
    );
  }

  getSimilarVideos(
    videoId: string
  ): Observable<ApiSuccessResponse<SimilarVideosResponse>> {
    return this.http.get<ApiSuccessResponse<SimilarVideosResponse>>(
      `${this.config.apiBaseUrl}/videos/${videoId}/similar`,
      { withCredentials: true }
    );
  }

  getStreamUrl(videoId: string): string {
    return `${this.config.apiBaseUrl}/stream/${videoId}`;
  }

  getDownloadUrl(videoId: string): string {
    return `${this.config.apiBaseUrl}/download/${videoId}`;
  }

  getThumbnailUrl(videoId: string): string {
    return `${this.config.apiBaseUrl}/thumbnail/${videoId}`;
  }

  getPreviewUrl(videoId: string): string {
    return `${this.config.apiBaseUrl}/preview/${videoId}`;
  }

  getPreviewThumbsUrl(videoId: string): string {
    return `${this.config.apiBaseUrl}/preview-thumbnails/${videoId}/thumbnails.vtt`;
  }

  getTrimmedDownloadUrl(videoId: string, start: number, end?: number): string {
    const params = new URLSearchParams();
    params.set('start', start.toString());
    if (end !== undefined) {
      params.set('end', end.toString());
    }
    return `${
      this.config.apiBaseUrl
    }/download/${videoId}/trim?${params.toString()}`;
  }

  addVideoTag(
    videoId: string,
    tag: string
  ): Observable<ApiSuccessResponse<{ tags: string[] }>> {
    return this.http.post<ApiSuccessResponse<{ tags: string[] }>>(
      `${this.config.apiBaseUrl}/videos/tags/${videoId}/add`,
      { tag },
      { withCredentials: true }
    );
  }

  removeVideoTag(
    videoId: string,
    tag: string
  ): Observable<ApiSuccessResponse<{ tags: string[] }>> {
    return this.http.post<ApiSuccessResponse<{ tags: string[] }>>(
      `${this.config.apiBaseUrl}/videos/tags/${videoId}/remove`,
      { tag },
      { withCredentials: true }
    );
  }
}
