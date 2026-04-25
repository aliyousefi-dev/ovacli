import { inject, Injectable } from '@angular/core';
import { OVASDKConfig } from '../global-config';
import { SortMode } from './api-types/sort';

@Injectable({
  providedIn: 'root',
})
export class ApiMap {
  private config = inject(OVASDKConfig);
  private base = this.config.apiBaseUrl;

  readonly repo = {
    info: () => `${this.base}/repo/info`,
  };

  readonly auth = {
    login: () => `${this.base}/auth/login`,
    logout: () => `${this.base}/auth/logout`,
    status: () => `${this.base}/auth/status`,
    changePassword: () => `${this.base}/auth/change-password`,
  };

  readonly videos = {
    libraryUrl: (page: number, sortMode?: SortMode) => {
      let baseUrl = `${this.base}/videos/global?page=${page}`; // Assuming 'this.base' is available
      if (sortMode) {
        baseUrl += `&sort=${sortMode}`; // Append the sort mode to the URL
      }
      return baseUrl;
    },
    byId: (id: string) => `${this.base}/videos/${id}`,
    batch: () => `${this.base}/videos/batch`,
    filters: () => `${this.base}/videos/global/filters`,
    markers: (videoId: string) => `${this.base}/videos/${videoId}/markers`,
    tags: {
      add: (id: string) => `${this.base}/videos/tags/${id}/add`,
      remove: (id: string) => `${this.base}/videos/tags/${id}/remove`,
    },
  };

  readonly profile = {
    info: () => `${this.base}/profile/info`,
  };

  readonly users = {
    recent: (username: string) => `${this.base}/users/${username}/recent`,
  };

  readonly previews = {
    scrubVtt: (videoId: string) =>
      `${this.base}/preview-thumbnails/${videoId}/thumbnails.vtt`,
  };

  readonly search = {
    defaultSearchUrl: (
      q: string,
      tags: string[],
      page: number = 1,
      sortMode?: SortMode,
      markerLabel?: string,
    ) => {
      let url = `${this.base}/search?q=${encodeURIComponent(q)}`;
      if (tags && tags.length > 0) {
        url += `&tags=${tags.map((t) => encodeURIComponent(t)).join(',')}`;
      }
      if (markerLabel && markerLabel.length > 0) {
        url += `&marker=${encodeURIComponent(markerLabel)}`;
      }
      url += `&page=${page}`;
      if (sortMode) {
        url += `&sort=${sortMode}`; // Append the sort mode to the URL
      }
      return url;
    },
    quickSearchUrl: () => `${this.base}/quick-search`,
    similarSearchUrl: (id: string) => `${this.base}/videos/${id}/similar`,
  };

  readonly upload = {
    video: () => `${this.base}/upload`,
  };

  readonly me = {
    recent: (page: number) => `${this.base}/me/recent?page=${page}`,
    saved: {
      list: (page: number) => `${this.base}/me/saved?page=${page}`,
      video: (videoId: string) => `${this.base}/me/saved/${videoId}`,
    },
    playlists: {
      base: () => `${this.base}/me/playlists`,
      bySlug: (slug: string) => `${this.base}/me/playlists/${slug}`,
      order: () => `${this.base}/me/playlists/order`,

      content: {
        fetch: (playlistId: string, page: number) =>
          `${this.base}/me/playlists/${playlistId}?page=${page}`,
        addVideo: (playlistId: string) =>
          `${this.base}/me/playlists/${playlistId}/videos`,
        removeVideo: (slug: string, videoId: string) =>
          `${this.base}/me/playlists/${slug}/videos/${videoId}`,
      },
    },
  };
}
