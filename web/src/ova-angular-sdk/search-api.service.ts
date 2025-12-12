import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiSuccessResponse } from './api-responses/core-response';

import { environment } from '../environments/environment';
import { SearchResponse } from './api-responses/search-response';

@Injectable({
  providedIn: 'root',
})
export class SearchApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // search-api.service.ts
  searchVideos(params: {
    query?: string;
    tags?: string[];
  }): Observable<ApiSuccessResponse<SearchResponse>> {
    return this.http.post<ApiSuccessResponse<SearchResponse>>(
      `${this.baseUrl}/search`,
      params
    );
  }
}
