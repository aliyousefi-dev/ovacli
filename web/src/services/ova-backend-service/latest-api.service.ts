import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoBucketResponse } from './api-responses/video-bucket';

import { ApiSuccessResponse } from './api-responses/core-response';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LatestVideosService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Fetch the latest videos based on the specified bucket
  getLatestVideos(
    bucket: number = 1
  ): Observable<ApiSuccessResponse<VideoBucketResponse>> {
    // Construct the URL with bucket query parameter
    const url = `${this.baseUrl}/videos/global?bucket=${bucket}`;
    return this.http.get<ApiSuccessResponse<VideoBucketResponse>>(url);
  }
}
