import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from './api-responses/core-response';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthStatusResponse } from './api-responses/auth-status';
import { handleApiError } from './api-responses/error-handler';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  login(
    username: string,
    password: string
  ): Observable<ApiSuccessResponse<{ sessionId: string }>> {
    return this.http
      .post<ApiSuccessResponse<{ sessionId: string }>>(
        `${this.baseUrl}/auth/login`,
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
      .post<ApiSuccessResponse<null>>(`${this.baseUrl}/auth/logout`, null, {
        withCredentials: true,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => handleApiError(error));
        })
      );
  }

  checkLoginState(): Observable<ApiSuccessResponse<AuthStatusResponse>> {
    return this.http
      .get<ApiSuccessResponse<AuthStatusResponse>>(
        `${this.baseUrl}/auth/status`,
        { withCredentials: true }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => handleApiError(error)); // Use the utility function
        })
      );
  }
}
