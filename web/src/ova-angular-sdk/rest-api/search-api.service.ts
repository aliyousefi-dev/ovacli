import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiSuccessResponse } from './api-types/core-response';
import { SimilarVideosResponse } from './api-types/similar-videos-response';

import { SearchCriteria, SearchResult } from './api-types/search-response';

import { ApiMap } from './api-map';
import { PageContainer } from '../core-types/page-container';

@Injectable({
  providedIn: 'root',
})
export class SearchApiService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  // search-api.service.ts
  searchVideos(
    request: SearchCriteria,
    page: number,
  ): Observable<ApiSuccessResponse<PageContainer>> {
    const url = this.apiMap.search.videos(request.query, request.tags, page);

    return this.http.get<ApiSuccessResponse<PageContainer>>(url);
  }

  getSimilarVideos(
    videoId: string,
  ): Observable<ApiSuccessResponse<SimilarVideosResponse>> {
    const url = this.apiMap.search.similar(videoId);

    return this.http.get<ApiSuccessResponse<SimilarVideosResponse>>(url);
  }
}
