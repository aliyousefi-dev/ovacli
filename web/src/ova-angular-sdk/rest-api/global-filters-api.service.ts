import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalFilter } from './api-types/global-filter';

import { ApiSuccessResponse } from './api-types/core-response';

import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class GlobalFiltersApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  getGlobalFilters(): Observable<ApiSuccessResponse<GlobalFilter[]>> {
    const url = `${this.config.apiBaseUrl}/videos/global/filters`; // API endpoint for filters
    return this.http.get<ApiSuccessResponse<GlobalFilter[]>>(url);
  }
}
