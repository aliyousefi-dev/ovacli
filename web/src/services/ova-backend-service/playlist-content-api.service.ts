import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { PlaylistData } from './api-types/playlist-data';

import { ApiSuccessResponse } from './api-responses/core-response';

import { PlaylistContentResponse } from './api-responses/playlist-response';

@Injectable({
  providedIn: 'root',
})
export class PlaylistContentAPIService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  fetchPlaylistContent(
    username: string,
    slug: string,
    bucket: number = 1
  ): Observable<ApiSuccessResponse<PlaylistContentResponse>> {
    return this.http.get<ApiSuccessResponse<PlaylistContentResponse>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}?bucket=${bucket}`,
      { withCredentials: true } // ✅ important
    );
  }

  addVideoToPlaylist(
    username: string,
    slug: string,
    videoId: string
  ): Observable<ApiSuccessResponse<PlaylistData>> {
    return this.http.post<ApiSuccessResponse<PlaylistData>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}/videos`,
      { videoId },
      { withCredentials: true } // ✅ important
    );
  }

  deleteVideoFromPlaylist(
    username: string,
    slug: string,
    videoId: string
  ): Observable<ApiSuccessResponse<PlaylistData>> {
    return this.http.delete<ApiSuccessResponse<PlaylistData>>(
      `${this.baseUrl}/users/${username}/playlists/${slug}/videos/${videoId}`,
      { withCredentials: true } // ✅ important
    );
  }
}
