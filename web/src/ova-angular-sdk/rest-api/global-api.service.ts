import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PageContainer } from '../core-types/page-container';

import { ApiSuccessResponse } from './api-types/core-response';

import { ApiMap } from './api-map';

import { SortMode } from './api-types/sort';

@Injectable({
  providedIn: 'root',
})
export class GlobalVideosService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  // Fetch the latest videos based on the specified bucket
  fetchGlobalVideos(
    page: number = 1,
    sortMode?: SortMode,
  ): Observable<ApiSuccessResponse<PageContainer>> {
    const url = this.apiMap.videos.global(page, sortMode);
    return this.http.get<ApiSuccessResponse<PageContainer>>(url);
  }
}
