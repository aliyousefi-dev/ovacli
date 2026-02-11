import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from './api-types/core-response';

import { VideoBucketContainer } from './api-types/video-bucket';
import { PageContainer } from '../core-types/page-container';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class SavedApiService {
  private httpOptions = { withCredentials: true };
  private http = inject(HttpClient);

  private apiMap = inject(ApiMap);

  getUserSaved(
    bucket: number = 1,
  ): Observable<ApiSuccessResponse<PageContainer>> {
    const url = this.apiMap.me.saved.list(bucket);

    return this.http.get<ApiSuccessResponse<PageContainer>>(
      url,
      this.httpOptions,
    );
  }

  addUserSaved(
    videoId: string,
  ): Observable<{ username: string; videoId: string }> {
    const url = this.apiMap.me.saved.video(videoId);
    const body = {};

    return this.http
      .post<{
        data: { username: string; videoId: string };
      }>(url, body)
      .pipe(map((response) => response.data));
  }

  removeUserSaved(
    videoId: string,
  ): Observable<{ username: string; videoId: string }> {
    const url = this.apiMap.me.saved.video(videoId);

    return this.http
      .delete<{
        data: { username: string; videoId: string };
      }>(url)
      .pipe(map((response) => response.data));
  }
}
