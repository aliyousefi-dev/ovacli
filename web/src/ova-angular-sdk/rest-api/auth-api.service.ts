import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiSuccessResponse } from './api-types/core-response';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthStatusResponse } from './api-types/auth-status';
import { handleApiError } from './api-types/error-handler';
import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  login(
    username: string,
    password: string,
  ): Observable<ApiSuccessResponse<null>> {
    const url = this.apiMap.auth.login();
    const body = { username, password };

    return this.http.post<ApiSuccessResponse<null>>(url, body).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => handleApiError(error));
      }),
    );
  }

  logout(): Observable<ApiSuccessResponse<null>> {
    const url = this.apiMap.auth.logout();
    const body = null;

    return this.http.post<ApiSuccessResponse<null>>(url, body).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => handleApiError(error));
      }),
    );
  }

  checkLoginState(): Observable<ApiSuccessResponse<AuthStatusResponse>> {
    const url = this.apiMap.auth.status();

    return this.http.get<ApiSuccessResponse<AuthStatusResponse>>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => handleApiError(error)); // Use the utility function
      }),
    );
  }
}
