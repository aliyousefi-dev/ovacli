import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../core-types/user-profile';

import { ApiSuccessResponse } from './api-responses/core-response';
import { environment } from '../../environments/environment';
import { AuthStatusResponse } from './api-responses/auth-status';
import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(
      `${this.config.apiBaseUrl}/profile/info`,
      {
        withCredentials: true,
      }
    );
  }

  updatePassword(
    oldpassword: string,
    newpassword: string
  ): Observable<ApiSuccessResponse<AuthStatusResponse>> {
    return this.http.post<ApiSuccessResponse<AuthStatusResponse>>(
      `${this.config.apiBaseUrl}/auth/login`,
      { oldpassword, newpassword },
      { withCredentials: true }
    );
  }
}
