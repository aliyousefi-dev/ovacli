import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from './response-type';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface LoginError {
  code: number;
  message: string;
}

interface ErrorResponse {
  error: LoginError;
  status: string;
}

export interface LoginResponse {
  data: {
    sessionId: string;
  };
  message: string;
  status: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  username?: string;
}

export interface UserProfile {
  username: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  login(
    username: string,
    password: string
  ): Observable<ApiResponse<{ sessionId: string }>> {
    return this.http
      .post<ApiResponse<{ sessionId: string }>>(
        `${this.baseUrl}/auth/login`,
        { username, password },
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          if (response.data?.sessionId) {
            localStorage.setItem('sessionId', response.data.sessionId);
          }
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'An error occurred during login.';

          if (error.status === 0) {
            errorMessage =
              'Cannot connect to the server. Please try again later.';
          } else if (error.status >= 500) {
            errorMessage = 'Server error occurred. Please try again later.';
          } else {
            const backendError = error.error as ErrorResponse;
            if (backendError?.error?.message) {
              errorMessage = backendError.error.message;
            }
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.baseUrl}/auth/logout`,
      null,
      { withCredentials: true }
    );
  }

  checkAuth(): Observable<AuthStatusResponse> {
    return this.getAuthStatusFull().pipe(map((res) => res.data));
  }

  getAuthStatusFull(): Observable<ApiResponse<AuthStatusResponse>> {
    return this.http.get<ApiResponse<AuthStatusResponse>>(
      `${this.baseUrl}/auth/status`,
      { withCredentials: true }
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/auth/profile`, {
      withCredentials: true,
    });
  }

  updatePassword(
    oldpassword: string,
    newpassword: string
  ): Observable<ApiResponse<AuthStatusResponse>> {
    return this.http.post<ApiResponse<AuthStatusResponse>>(
      `${this.baseUrl}/auth/login`,
      { oldpassword, newpassword },
      { withCredentials: true }
    );
  }
}
