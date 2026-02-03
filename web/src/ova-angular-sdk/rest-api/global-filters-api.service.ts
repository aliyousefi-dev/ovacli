import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalFilter } from './api-types/global-filter';

import { ApiSuccessResponse } from './api-types/core-response';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class GlobalFiltersApiService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  getGlobalFilters(): Observable<ApiSuccessResponse<GlobalFilter[]>> {
    const url = this.apiMap.videos.filters();
    return this.http.get<ApiSuccessResponse<GlobalFilter[]>>(url);
  }
}
