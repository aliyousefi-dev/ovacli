import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoBucketContainer } from './api-types/video-bucket';

import { ApiSuccessResponse } from './api-types/core-response';

import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class GlobalVideosService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  // Fetch the latest videos based on the specified bucket
  fetchGlobalVideos(
    bucket: number = 1
  ): Observable<ApiSuccessResponse<VideoBucketContainer>> {
    // Construct the URL with bucket query parameter
    const url = this.getGlobalVideosUrl(bucket);
    return this.http.get<ApiSuccessResponse<VideoBucketContainer>>(url);
  }

  getGlobalVideosUrl(bucket: number): string {
    return `${this.config.apiBaseUrl}/videos/global?bucket=${bucket}`;
  }
}
