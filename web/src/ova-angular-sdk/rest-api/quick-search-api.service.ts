import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiSuccessResponse } from './api-types/core-response';

import { QuickSearchResponse } from './api-types/quick-search-response';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class QuickSearchApiService {
  private http = inject(HttpClient);

  private apiMap = inject(ApiMap);

  quickSearch(
    query: string,
  ): Observable<ApiSuccessResponse<QuickSearchResponse>> {
    const url = this.apiMap.search.quickSearchUrl();
    const body = { query };

    return this.http.post<ApiSuccessResponse<QuickSearchResponse>>(url, body);
  }
}
