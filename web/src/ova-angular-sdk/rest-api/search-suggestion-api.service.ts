import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiSuccessResponse } from './api-responses/core-response';

import { SearchSuggestionsResponse } from './api-responses/searchsuggestions-response';
import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class SuggestionApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  getSearchSuggestions(
    query: string
  ): Observable<ApiSuccessResponse<SearchSuggestionsResponse>> {
    const params = { query }; // The query parameter to send in the request body

    return this.http.post<ApiSuccessResponse<SearchSuggestionsResponse>>(
      `${this.config.apiBaseUrl}/search-suggestions`,
      params
    );
  }
}
