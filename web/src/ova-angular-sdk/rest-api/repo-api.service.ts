import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalFilter } from './api-types/global-filter';

import { ApiSuccessResponse } from './api-types/core-response';

import { ApiMap } from './api-map';
import { RepoInfo } from './api-types/repo-info';

@Injectable({
  providedIn: 'root',
})
export class RepoApiService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  getRepoInfo(): Observable<ApiSuccessResponse<{ info: RepoInfo }>> {
    const url = this.apiMap.repo.info();
    return this.http.get<ApiSuccessResponse<{ info: RepoInfo }>>(url);
  }
}
