import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiSuccessResponse } from './api-responses/core-response';

import { environment } from '../../../environments/environment';
import { SearchSuggestionsResponse } from './api-responses/searchsuggestions-response';

@Injectable({
  providedIn: 'root',
})
export class SuggestionApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getSearchSuggestions(
    query: string
  ): Observable<ApiSuccessResponse<SearchSuggestionsResponse>> {
    const params = { query }; // The query parameter to send in the request body

    return this.http.post<ApiSuccessResponse<SearchSuggestionsResponse>>(
      `${this.baseUrl}/search-suggestions`,
      params
    );
  }
}
