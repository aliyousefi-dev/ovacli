import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from './core-types/user-profile';
import { map } from 'rxjs/operators';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from './api-responses/core-response';
import { environment } from '../environments/environment';
import { AuthStatusResponse } from './api-responses/auth-status';

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile/info`, {
      withCredentials: true,
    });
  }

  updatePassword(
    oldpassword: string,
    newpassword: string
  ): Observable<ApiSuccessResponse<AuthStatusResponse>> {
    return this.http.post<ApiSuccessResponse<AuthStatusResponse>>(
      `${this.baseUrl}/auth/login`,
      { oldpassword, newpassword },
      { withCredentials: true }
    );
  }
}
