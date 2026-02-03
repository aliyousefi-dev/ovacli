import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiSuccessResponse } from './api-types/core-response';
import { SimilarVideosResponse } from './api-types/similar-videos-response';

import { SearchResult } from './api-types/search-response';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class SearchApiService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  // search-api.service.ts
  searchVideos(params: {
    query?: string;
    tags?: string[];
    bucketnumber?: number;
  }): Observable<ApiSuccessResponse<SearchResult>> {
    const url = this.apiMap.search.videos(params.bucketnumber);
    const body = params;

    return this.http.post<ApiSuccessResponse<SearchResult>>(url, body);
  }

  getSimilarVideos(
    videoId: string,
  ): Observable<ApiSuccessResponse<SimilarVideosResponse>> {
    const url = this.apiMap.search.similar(videoId);

    return this.http.get<ApiSuccessResponse<SimilarVideosResponse>>(url);
  }
}
