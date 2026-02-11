import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PageContainer } from '../core-types/page-container';

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
    page: number = 1,
  ): Observable<ApiSuccessResponse<PageContainer>> {
    const url = this.apiMap.videos.global(page);
    return this.http.get<ApiSuccessResponse<PageContainer>>(url);
  }
}
