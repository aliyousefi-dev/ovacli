import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiSuccessResponse } from './api-types/core-response';

import { VideoBucketContainer } from './api-types/video-bucket';
import { PageContainer } from '../core-types/page-container';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class WatchedApiService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  getUserWatched(
    page: number = 1,
  ): Observable<ApiSuccessResponse<PageContainer>> {
    const url = this.apiMap.me.recent(page);
    return this.http.get<ApiSuccessResponse<PageContainer>>(url);
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
