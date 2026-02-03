import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiSuccessResponse } from './api-types/core-response';

import { VideoBucketContainer } from './api-types/video-bucket';

import { OVASDKConfig } from '../global-config';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class WatchedApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);
  private apiMap = inject(ApiMap);

  getUserWatched(
    bucket: number = 1,
  ): Observable<ApiSuccessResponse<VideoBucketContainer>> {
    const url = this.apiMap.me.recent(bucket);
    return this.http.get<ApiSuccessResponse<VideoBucketContainer>>(url);
  }

  addUserWatched(
    username: string,
    videoId: string,
  ): Observable<{ message: string }> {
    const url = this.apiMap.users.recent(username);
    const body = videoId;

    return this.http.post<{
      message: string;
    }>(url, body);
  }

  clearUserWatched(username: string): Observable<{ message: string }> {
    const url = this.apiMap.users.recent(username);

    return this.http.delete<{ message: string }>(url);
  }
}
