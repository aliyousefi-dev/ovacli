import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { PlaylistData } from '../core-types/playlist-data';

import { ApiSuccessResponse } from './api-types/core-response';

import { PlaylistContentResponse } from './api-types/playlist-response';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class PlaylistContentAPIService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  fetchPlaylistContent(
    slug: string,
    bucket: number = 1,
  ): Observable<ApiSuccessResponse<PlaylistContentResponse>> {
    const url = this.apiMap.me.playlists.content.fetch(slug, bucket);

    return this.http.get<ApiSuccessResponse<PlaylistContentResponse>>(url);
  }

  addVideoToPlaylist(
    slug: string,
    videoId: string,
  ): Observable<ApiSuccessResponse<PlaylistData>> {
    const url = this.apiMap.me.playlists.content.addVideo(slug);
    const body = videoId;

    return this.http.post<ApiSuccessResponse<PlaylistData>>(url, body);
  }

  deleteVideoFromPlaylist(
    slug: string,
    videoId: string,
  ): Observable<ApiSuccessResponse<PlaylistData>> {
    const url = this.apiMap.me.playlists.content.removeVideo(slug, videoId);

    return this.http.delete<ApiSuccessResponse<PlaylistData>>(url);
  }
}
