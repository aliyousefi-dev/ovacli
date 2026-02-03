import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OVASDKConfig } from '../global-config';

import { VideoData } from '../core-types/video-data';
import { ApiSuccessResponse } from './api-types/core-response';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class VideoApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);
  private apiMap = inject(ApiMap);

  getVideoById(videoId: string): Observable<ApiSuccessResponse<VideoData>> {
    const url = this.apiMap.videos.byId(videoId);

    return this.http.get<ApiSuccessResponse<VideoData>>(url);
  }

  getVideosByIds(ids: string[]): Observable<ApiSuccessResponse<VideoData[]>> {
    const url = this.apiMap.videos.batch();
    const body = { IDs: ids };

    return this.http.post<ApiSuccessResponse<VideoData[]>>(url, body);
  }

  addVideoTag(
    videoId: string,
    tag: string,
  ): Observable<ApiSuccessResponse<{ tags: string[] }>> {
    const url = this.apiMap.videos.tags.add(videoId);
    const body = { tag };

    return this.http.post<ApiSuccessResponse<{ tags: string[] }>>(url, body);
  }

  removeVideoTag(
    videoId: string,
    tag: string,
  ): Observable<ApiSuccessResponse<{ tags: string[] }>> {
    const url = this.apiMap.videos.tags.remove(videoId);
    const body = { tag };

    return this.http.post<ApiSuccessResponse<{ tags: string[] }>>(url, body);
  }
}
