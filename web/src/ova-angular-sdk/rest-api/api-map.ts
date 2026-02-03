import { inject, Injectable } from '@angular/core';
import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class ApiMap {
  private config = inject(OVASDKConfig);
  private base = this.config.apiBaseUrl;

  readonly auth = {
    login: () => `${this.base}/auth/login`,
    logout: () => `${this.base}/auth/logout`,
    status: () => `${this.base}/auth/status`,
    changePassword: () => `${this.base}/auth/change-password`,
  };

  readonly videos = {
    global: (bucket: number) => `${this.base}/videos/global?bucket=${bucket}`,
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
    // Dynamic username section
    recent: (username: string) => `${this.base}/users/${username}/recent`,
  };

  readonly previews = {
    scrubVtt: (videoId: string) =>
      `${this.base}/preview-thumbnails/${videoId}/thumbnails.vtt`,
  };

  readonly search = {
    videos: (bucket: number = 1) => `${this.base}/search?bucket=${bucket}`,
    suggestions: () => `${this.base}/search/suggestions`,
    similar: (id: string) => `${this.base}/videos/${id}/similar`,
  };

  readonly upload = {
    video: () => `${this.base}/upload`,
  };

  readonly me = {
    recent: (bucket: number) => `${this.base}/me/recent?bucket=${bucket}`,
    saved: {
      list: (bucket: number) => `${this.base}/me/saved?bucket=${bucket}`,
      video: (videoId: string) => `${this.base}/me/saved/${videoId}`,
    },
    playlists: {
      base: () => `${this.base}/me/playlists`,
      bySlug: (slug: string) => `${this.base}/me/playlists/${slug}`,
      order: () => `${this.base}/me/playlists/order`,

      content: {
        fetch: (slug: string, bucket: number) =>
          `${this.base}/me/playlists/${slug}?bucket=${bucket}`,
        addVideo: (slug: string) => `${this.base}/me/playlists/${slug}/videos`,
        removeVideo: (slug: string, videoId: string) =>
          `${this.base}/me/playlists/${slug}/videos/${videoId}`,
      },
    },
  };
}
