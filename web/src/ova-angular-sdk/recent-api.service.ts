import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiSuccessResponse } from './api-responses/core-response';

import { environment } from '../environments/environment';
import { VideoBucketResponse } from './api-responses/video-bucket';

@Injectable({
  providedIn: 'root',
})
export class WatchedApiService {
  private baseUrl = environment.apiBaseUrl;
  private httpOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  getUserWatched(
    bucket: number = 1
  ): Observable<ApiSuccessResponse<VideoBucketResponse>> {
    // Use ApiResponse wrapper
    return this.http
      .get<ApiSuccessResponse<VideoBucketResponse>>(
        `${this.baseUrl}/me/recent?bucket=${bucket}`,
        this.httpOptions
      )
      .pipe(catchError(this.handleError)); // Handle errors as before
  }
  /**
   * Mark a video as watched for a specific user.
   * @param username The username for whom to mark the video as watched.
   * @param videoId The ID of the video to mark as watched.
   * @returns An Observable with a success message.
   */
  addUserWatched(
    username: string,
    videoId: string
  ): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.baseUrl}/users/${username}/recent`,
        { videoId },
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Clears the entire watched history for a specific user.
   * @param username The username whose watched history is to be cleared.
   * @returns An Observable with a success message.
   */
  clearUserWatched(username: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(
        `${this.baseUrl}/users/${username}/recent`, // This maps to your DELETE /users/:username/watched endpoint
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Watched API error:', error);
    return throwError(
      () => new Error(error.error?.message || 'Watched API error')
    );
  }
}
