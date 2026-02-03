import { inject, Injectable } from '@angular/core';
import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class AssetMap {
  private config = inject(OVASDKConfig);
  private get base() {
    return this.config.apiBaseUrl;
  }

  stream = (id: string) => `${this.base}/stream/${id}`;
  thumbnail = (id: string) => `${this.base}/thumbnail/${id}`;
  preview = (id: string) => `${this.base}/preview/${id}`;
  previewVtt = (id: string) =>
    `${this.base}/preview-thumbnails/${id}/thumbnails.vtt`;

  readonly download = {
    full: (id: string) => `${this.base}/download/${id}`,
    trim: (id: string, start: number, end?: number) => {
      let url = `${this.base}/download/${id}/trim?start=${start}`;
      if (end !== undefined) url += `&end=${end}`;
      return url;
    },
  };
}
