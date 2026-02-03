// marker-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiSuccessResponse } from './api-types/core-response';
import { VideoMarker } from '../core-types/video-marker';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class MarkerApiService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  getMarkers(
    videoId: string,
  ): Observable<ApiSuccessResponse<{ markers: VideoMarker[] }>> {
    const url = this.apiMap.videos.markers(videoId);

    return this.http.get<ApiSuccessResponse<{ markers: VideoMarker[] }>>(url);
  }

  addMarker(
    videoId: string,
    marker: { timeSecond: number; label: string; description: string },
  ): Observable<ApiSuccessResponse<null>> {
    const url = this.apiMap.videos.markers(videoId);
    const body = marker;

    return this.http.post<ApiSuccessResponse<null>>(url, body);
  }
}
