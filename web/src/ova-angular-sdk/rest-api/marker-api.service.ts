// marker-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiSuccessResponse } from './api-types/core-response';
import { VideoMarker } from '../core-types/video-marker';

import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class MarkerApiService {
  // Ensure baseUrl is safely initialized with a fallback.
  // In a typical Angular setup, environment.apiBaseUrl will be defined.

  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  getMarkers(
    videoId: string
  ): Observable<ApiSuccessResponse<{ markers: VideoMarker[] }>> {
    // The Go API will now send back markers with 'hour', 'minute', 'second' fields.
    return this.http.get<ApiSuccessResponse<{ markers: VideoMarker[] }>>(
      `${this.config.apiBaseUrl}/videos/${videoId}/markers`,
      { withCredentials: true }
    );
  }

  addMarker(
    videoId: string,
    marker: { timeSecond: number; label: string; description: string }
  ): Observable<ApiSuccessResponse<null>> {
    return this.http.post<ApiSuccessResponse<null>>(
      `${this.config.apiBaseUrl}/videos/${videoId}/markers`,
      marker,
      { withCredentials: true }
    );
  }
}
