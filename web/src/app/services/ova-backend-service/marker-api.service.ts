// marker-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from './api-responses/core-response';
import { VideoMarker } from './api-types/video-marker';

@Injectable({
  providedIn: 'root',
})
export class MarkerApiService {
  // Ensure baseUrl is safely initialized with a fallback.
  // In a typical Angular setup, environment.apiBaseUrl will be defined.
  private baseUrl = environment.apiBaseUrl || '/api';

  constructor(private http: HttpClient) {}

  getMarkerFileUrl(videoId: string): string {
    return `${this.baseUrl}/video/markers/${videoId}/file`;
  }

  getMarkers(
    videoId: string
  ): Observable<ApiSuccessResponse<{ markers: VideoMarker[] }>> {
    // The Go API will now send back markers with 'hour', 'minute', 'second' fields.
    return this.http.get<ApiSuccessResponse<{ markers: VideoMarker[] }>>(
      `${this.baseUrl}/video/markers/${videoId}`,
      { withCredentials: true }
    );
  }

  updateMarkers(
    videoId: string,
    markers: VideoMarker[]
  ): Observable<ApiSuccessResponse<any>> {
    // The Go API will receive this array of markers with hour, minute, second.
    return this.http.post<ApiSuccessResponse<any>>(
      `${this.baseUrl}/video/markers/${videoId}`,
      { markers },
      { withCredentials: true }
    );
  }

  deleteAllMarkers(videoId: string): Observable<ApiSuccessResponse<any>> {
    return this.http.delete<ApiSuccessResponse<any>>(
      `${this.baseUrl}/video/markers/${videoId}`,
      { withCredentials: true }
    );
  }

  deleteMarker(
    videoId: string,
    markerToDelete: { hour: number; minute: number; second: number }
  ): Observable<ApiSuccessResponse<any>> {
    // The hour, minute, and second are passed as part of the URL,
    // reflecting the updated Go API route.
    return this.http.delete<ApiSuccessResponse<any>>(
      `${this.baseUrl}/video/markers/${videoId}/${markerToDelete.hour}/${markerToDelete.minute}/${markerToDelete.second}`,
      { withCredentials: true }
    );
  }
}
