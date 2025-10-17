import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoData } from '../../data-types/video-data';

import { ApiResponse } from './response-type';

import { environment } from '../../../environments/environment';

export interface SearchResponse {
  query: string;
  results: VideoData[];
  totalCount: number;
}

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
  }): Observable<ApiResponse<SearchResponse>> {
    return this.http.post<ApiResponse<SearchResponse>>(
      `${this.baseUrl}/search`,
      params
    );
  }
}
