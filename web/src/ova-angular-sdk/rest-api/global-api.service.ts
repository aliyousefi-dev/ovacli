import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoBucketContainer } from './api-types/video-bucket';

import { ApiSuccessResponse } from './api-types/core-response';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class GlobalVideosService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  // Fetch the latest videos based on the specified bucket
  fetchGlobalVideos(
    bucket: number = 1,
  ): Observable<ApiSuccessResponse<VideoBucketContainer>> {
    // Construct the URL with bucket query parameter
    const url = this.apiMap.videos.global(bucket);
    return this.http.get<ApiSuccessResponse<VideoBucketContainer>>(url);
  }
}
