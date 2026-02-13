import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { PageContainer } from '../core-types/page-container';

import { ApiSuccessResponse } from './api-types/core-response';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class PlaylistContentAPIService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  fetchPlaylistContent(
    playlistId: string,
    page: number = 1,
  ): Observable<ApiSuccessResponse<PageContainer>> {
    const url = this.apiMap.me.playlists.content.fetch(playlistId, page);

    return this.http.get<ApiSuccessResponse<PageContainer>>(url);
  }

  addVideoToPlaylist(
    slug: string,
    videoId: string,
  ): Observable<ApiSuccessResponse<PageContainer>> {
    const url = this.apiMap.me.playlists.content.addVideo(slug);
    const body = videoId;

    return this.http.post<ApiSuccessResponse<PageContainer>>(url, body);
  }

  deleteVideoFromPlaylist(
    slug: string,
    videoId: string,
  ): Observable<ApiSuccessResponse<PageContainer>> {
    const url = this.apiMap.me.playlists.content.removeVideo(slug, videoId);

    return this.http.delete<ApiSuccessResponse<PageContainer>>(url);
  }
}
