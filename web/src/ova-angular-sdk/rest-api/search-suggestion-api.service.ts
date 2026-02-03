import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiSuccessResponse } from './api-types/core-response';

import { SearchSuggestionsResponse } from './api-types/searchsuggestions-response';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class SuggestionApiService {
  private http = inject(HttpClient);

  private apiMap = inject(ApiMap);

  getSearchSuggestions(
    query: string,
  ): Observable<ApiSuccessResponse<SearchSuggestionsResponse>> {
    const url = this.apiMap.search.suggestions();
    const body = { query };

    return this.http.post<ApiSuccessResponse<SearchSuggestionsResponse>>(
      url,
      body,
    );
  }
}
