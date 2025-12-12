import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { PlaylistData } from './core-types/playlist-data';

import { ApiSuccessResponse } from './api-responses/core-response';

import { PlaylistContentResponse } from './api-responses/playlist-response';

@Injectable({
  providedIn: 'root',
})
export class PlaylistContentAPIService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  fetchPlaylistContent(
    slug: string,
    bucket: number = 1
  ): Observable<ApiSuccessResponse<PlaylistContentResponse>> {
    return this.http.get<ApiSuccessResponse<PlaylistContentResponse>>(
      `${this.baseUrl}/me/playlists/${slug}?bucket=${bucket}`,
      { withCredentials: true } // ✅ important
    );
  }

  addVideoToPlaylist(
    slug: string,
    videoId: string
  ): Observable<ApiSuccessResponse<PlaylistData>> {
    return this.http.post<ApiSuccessResponse<PlaylistData>>(
      `${this.baseUrl}/me/playlists/${slug}/videos`,
      { videoId },
      { withCredentials: true } // ✅ important
    );
  }

  deleteVideoFromPlaylist(
    slug: string,
    videoId: string
  ): Observable<ApiSuccessResponse<PlaylistData>> {
    return this.http.delete<ApiSuccessResponse<PlaylistData>>(
      `${this.baseUrl}/me/playlists/${slug}/videos/${videoId}`,
      { withCredentials: true } // ✅ important
    );
  }
}
