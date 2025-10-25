import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiSuccessResponse } from './api-responses/core-response';

import { environment } from '../../../environments/environment';

import { VideoBucketResponse } from './api-responses/video-bucket';

@Injectable({
  providedIn: 'root',
})
export class SavedApiService {
  private baseUrl = environment.apiBaseUrl;

  private httpOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  getUserSaved(
    username: string,
    bucket: number = 1
  ): Observable<ApiSuccessResponse<VideoBucketResponse>> {
    return this.http
      .get<ApiSuccessResponse<VideoBucketResponse>>(
        `${this.baseUrl}/users/${username}/saved?bucket=${bucket}`,
        this.httpOptions
      )
      .pipe(catchError(this.handleError)); // Error handling remains unchanged
  }

  addUserSaved(
    username: string,
    videoId: string
  ): Observable<{ username: string; videoId: string }> {
    return this.http
      .post<{ data: { username: string; videoId: string } }>(
        `${this.baseUrl}/users/${username}/saved/${videoId}`,
        {}, // empty body
        this.httpOptions
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  removeUserSaved(
    username: string,
    videoId: string
  ): Observable<{ username: string; videoId: string }> {
    return this.http
      .delete<{ data: { username: string; videoId: string } }>(
        `${this.baseUrl}/users/${username}/saved/${videoId}`,
        this.httpOptions
      )
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Saved API error:', error);
    return throwError(
      () => new Error(error.error?.message || 'Saved API error')
    );
  }
}
