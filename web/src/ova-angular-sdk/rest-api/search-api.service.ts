import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiSuccessResponse } from './api-types/core-response';

import { SearchResult } from './api-types/search-response';

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
  }): Observable<ApiSuccessResponse<SearchResult>> {
    return this.http.post<ApiSuccessResponse<SearchResult>>(
      `${this.config.apiBaseUrl}/search?bucket=0`,
      params
    );
  }
}
