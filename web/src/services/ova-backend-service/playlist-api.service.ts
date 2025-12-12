import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { PlaylistData } from './api-types/playlist-data';

import { ApiSuccessResponse } from './api-responses/core-response';

import { PlaylistDataResponse } from './api-responses/playlist-response';

@Injectable({
  providedIn: 'root',
})
export class PlaylistAPIService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getUserPlaylists(): Observable<ApiSuccessResponse<PlaylistDataResponse>> {
    return this.http
      .get<ApiSuccessResponse<PlaylistDataResponse>>(
        `${this.baseUrl}/me/playlists`,
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          response.data.playlists = [...response.data.playlists].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );
          return response;
        })
      );
  }

  createUserPlaylist(playlist: {
    title: string;
    description?: string;
    videoIds: string[];
  }): Observable<ApiSuccessResponse<PlaylistData>> {
    return this.http
      .post<ApiSuccessResponse<PlaylistData>>(
        `${this.baseUrl}/me/playlists`,
        playlist,
        { withCredentials: true } // ✅ important
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let userFriendlyError = 'An unknown error occurred';
          if (
            error.error &&
            error.error.status === 'error' &&
            error.error.error?.message
          ) {
            userFriendlyError = error.error.error.message;
          }
          return throwError(() => new Error(userFriendlyError));
        })
      );
  }

  deleteUserPlaylistBySlug(slug: string): Observable<ApiSuccessResponse<null>> {
    return this.http.delete<ApiSuccessResponse<null>>(
      `${this.baseUrl}/me/playlists/${slug}`,
      { withCredentials: true } // ✅ important
    );
  }

  savePlaylistsOrder(order: string[]): Observable<ApiSuccessResponse<null>> {
    return this.http
      .put<ApiSuccessResponse<null>>(
        `${this.baseUrl}/me/playlists/order`,
        { order },
        { withCredentials: true }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let userFriendlyError = 'An unknown error occurred';
          if (
            error.error &&
            error.error.status === 'error' &&
            error.error.error?.message
          ) {
            userFriendlyError = error.error.error.message;
          }
          return throwError(() => new Error(userFriendlyError));
        })
      );
  }

  updateUserPlaylistInfo(
    slug: string,
    update: { title?: string; description?: string }
  ): Observable<ApiSuccessResponse<PlaylistData>> {
    return this.http
      .put<ApiSuccessResponse<PlaylistData>>(
        `${this.baseUrl}/me/playlists/${slug}`,
        update,
        { withCredentials: true }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let userFriendlyError = 'An unknown error occurred';
          if (
            error.error &&
            error.error.status === 'error' &&
            error.error.error?.message
          ) {
            userFriendlyError = error.error.error.message;
          }
          return throwError(() => new Error(userFriendlyError));
        })
      );
  }
}
