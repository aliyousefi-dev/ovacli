import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { PlaylistData } from '../core-types/playlist-data';

import { ApiSuccessResponse } from './api-types/core-response';

import { PlaylistContentResponse } from './api-types/playlist-response';
import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class PlaylistContentAPIService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  fetchPlaylistContent(
    slug: string,
    bucket: number = 1
  ): Observable<ApiSuccessResponse<PlaylistContentResponse>> {
    return this.http.get<ApiSuccessResponse<PlaylistContentResponse>>(
      `${this.config.apiBaseUrl}/me/playlists/${slug}?bucket=${bucket}`,
      { withCredentials: true } // ✅ important
    );
  }

  addVideoToPlaylist(
    slug: string,
    videoId: string
  ): Observable<ApiSuccessResponse<PlaylistData>> {
    return this.http.post<ApiSuccessResponse<PlaylistData>>(
      `${this.config.apiBaseUrl}/me/playlists/${slug}/videos`,
      { videoId },
      { withCredentials: true } // ✅ important
    );
  }

  deleteVideoFromPlaylist(
    slug: string,
    videoId: string
  ): Observable<ApiSuccessResponse<PlaylistData>> {
    return this.http.delete<ApiSuccessResponse<PlaylistData>>(
      `${this.config.apiBaseUrl}/me/playlists/${slug}/videos/${videoId}`,
      { withCredentials: true } // ✅ important
    );
  }
}
