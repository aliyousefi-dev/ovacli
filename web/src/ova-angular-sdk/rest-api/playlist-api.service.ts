import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { ApiSuccessResponse } from './api-types/core-response';
import { PlaylistSummary } from '../core-types/playlist-summary';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class PlaylistAPIService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  getUserPlaylists(): Observable<
    ApiSuccessResponse<{ playlists: PlaylistSummary[] }>
  > {
    const url = this.apiMap.me.playlists.base();

    return this.http
      .get<ApiSuccessResponse<{ playlists: PlaylistSummary[] }>>(url)
      .pipe(
        map((response) => {
          if (response.data.playlists && response.data.playlists.length > 0) {
            response.data.playlists = [...response.data.playlists].sort(
              (a, b) => (a.order ?? 0) - (b.order ?? 0),
            );
          }
          return response;
        }),
      );
  }

  createPlaylist(
    title: string,
    des: string,
  ): Observable<ApiSuccessResponse<PlaylistSummary>> {
    const url = this.apiMap.me.playlists.base();
    const body = {
      title: title,
      description: des,
    };

    return this.http.post<ApiSuccessResponse<PlaylistSummary>>(url, body).pipe(
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

  deletePlaylist(playlistId: string): Observable<ApiSuccessResponse<null>> {
    const url = this.apiMap.me.playlists.bySlug(playlistId);

    return this.http.delete<ApiSuccessResponse<null>>(url);
  }

  reorderPlaylists(order: string[]): Observable<ApiSuccessResponse<null>> {
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

  editPlaylist(
    playlistId: string,
    newTitle: string,
    newDesc: string,
  ): Observable<ApiSuccessResponse<PlaylistSummary>> {
    const url = this.apiMap.me.playlists.bySlug(playlistId);
    const body = { title: newTitle, description: newDesc };

    return this.http.put<ApiSuccessResponse<PlaylistSummary>>(url, body).pipe(
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
