import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoBucketResponse } from './api-types/video-bucket';

import { ApiSuccessResponse } from './api-types/core-response';

import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class LatestVideosService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  // Fetch the latest videos based on the specified bucket
  getLatestVideos(
    bucket: number = 1
  ): Observable<ApiSuccessResponse<VideoBucketResponse>> {
    // Construct the URL with bucket query parameter
    const url = `${this.config.apiBaseUrl}/videos/global?bucket=${bucket}`;
    return this.http.get<ApiSuccessResponse<VideoBucketResponse>>(url);
  }
}
