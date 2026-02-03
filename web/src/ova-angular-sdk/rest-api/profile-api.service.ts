import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../core-types/user-profile';

import { ApiSuccessResponse } from './api-types/core-response';
import { AuthStatusResponse } from './api-types/auth-status';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  getProfile(): Observable<UserProfile> {
    const url = this.apiMap.profile.info();

    return this.http.get<UserProfile>(url);
  }

  updatePassword(
    oldpassword: string,
    newpassword: string,
  ): Observable<ApiSuccessResponse<AuthStatusResponse>> {
    const url = this.apiMap.auth.changePassword();
    const body = { oldpassword, newpassword };

    return this.http.post<ApiSuccessResponse<AuthStatusResponse>>(url, body);
  }
}
