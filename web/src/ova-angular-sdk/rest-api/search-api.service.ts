import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiSuccessResponse } from './api-responses/core-response';

import { SearchResponse } from './api-responses/search-response';

import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class SearchApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  // search-api.service.ts
  searchVideos(params: {
    query?: string;
    tags?: string[];
  }): Observable<ApiSuccessResponse<SearchResponse>> {
    return this.http.post<ApiSuccessResponse<SearchResponse>>(
      `${this.config.apiBaseUrl}/search`,
      params
    );
  }
}
