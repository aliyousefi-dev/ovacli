import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { PlaylistData } from '../core-types/playlist-data';
import { ApiSuccessResponse } from './api-types/core-response';
import { PlaylistDataResponse } from './api-types/playlist-response';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class PlaylistAPIService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  getUserPlaylists(): Observable<ApiSuccessResponse<PlaylistDataResponse>> {
    const url = this.apiMap.me.playlists.base();

    return this.http.get<ApiSuccessResponse<PlaylistDataResponse>>(url).pipe(
      map((response) => {
        response.data.playlists = [...response.data.playlists].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        );
        return response;
      }),
    );
  }

  createUserPlaylist(playlist: {
    title: string;
    description?: string;
    videoIds: string[];
  }): Observable<ApiSuccessResponse<PlaylistData>> {
    const url = this.apiMap.me.playlists.base();
    const body = playlist;

    return this.http.post<ApiSuccessResponse<PlaylistData>>(url, body).pipe(
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
      }),
    );
  }

  deleteUserPlaylistBySlug(slug: string): Observable<ApiSuccessResponse<null>> {
    const url = this.apiMap.me.playlists.bySlug(slug);

    return this.http.delete<ApiSuccessResponse<null>>(url);
  }

  savePlaylistsOrder(order: string[]): Observable<ApiSuccessResponse<null>> {
    const url = this.apiMap.me.playlists.order();
    const body = order;

    return this.http.put<ApiSuccessResponse<null>>(url, body).pipe(
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
      }),
    );
  }

  updateUserPlaylistInfo(
    slug: string,
    update: { title?: string; description?: string },
  ): Observable<ApiSuccessResponse<PlaylistData>> {
    const url = this.apiMap.me.playlists.bySlug(slug);
    const body = update;

    return this.http.put<ApiSuccessResponse<PlaylistData>>(url, body).pipe(
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
      }),
    );
  }
}
