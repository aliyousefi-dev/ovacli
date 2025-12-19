import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from './api-types/core-response';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthStatusResponse } from './api-types/auth-status';
import { handleApiError } from './api-types/error-handler';
import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  login(
    username: string,
    password: string
  ): Observable<ApiSuccessResponse<{ sessionId: string }>> {
    return this.http
      .post<ApiSuccessResponse<{ sessionId: string }>>(
        `${this.config.apiBaseUrl}/auth/login`,
        { username, password },
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => handleApiError(error));
        })
      );
  }

  logout(): Observable<ApiSuccessResponse<null>> {
    return this.http
      .post<ApiSuccessResponse<null>>(
        `${this.config.apiBaseUrl}/auth/logout`,
        null,
        {
          withCredentials: true,
        }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => handleApiError(error));
        })
      );
  }

  checkLoginState(): Observable<ApiSuccessResponse<AuthStatusResponse>> {
    return this.http
      .get<ApiSuccessResponse<AuthStatusResponse>>(
        `${this.config.apiBaseUrl}/auth/status`,
        { withCredentials: true }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => handleApiError(error)); // Use the utility function
        })
      );
  }
}
