import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ScrubThumbStat,
  ScrubThumbStream,
} from '../core-types/scrub-thumb-data';
import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class ScrubThumbApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  /** Convert "HH:MM:SS" → seconds */
  private timeToSeconds(time: string): number {
    const [h, m, s] = time.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }

  getScrubThumbsUrl(videoId: string): string {
    return `${this.config.apiBaseUrl}/preview-thumbnails/${videoId}/thumbnails.vtt`;
  }

  /** Load scrub‑thumbnails and wrap them in a `ScrubThumbStream`. */
  loadScrubThumbnails(videoId: string): Observable<ScrubThumbStream> {
    return this.http
      .get(this.getScrubThumbsUrl(videoId), { responseType: 'text' })
      .pipe(
        map((vtt: string) => {
          const blocks = vtt.split('\n\n').filter((b) => b.trim() !== '');

          const thumbStats: ScrubThumbStat[] = [];

          // Capture the crop dimensions from the **first** block.
          // All other blocks use the same width/height, so we just re‑use it.
          let cropedWidth = 0;
          let cropedHeight = 0;

          for (const [index, block] of blocks.entries()) {
            const lines = block.split('\n');
            if (lines.length < 2) continue;

            const [start, end] = lines[0]
              .split(' --> ')
              .map(this.timeToSeconds);

            const [urlBase, coords] = lines[1].split('#xywh=');
            const [x, y, w, h] = coords.split(',').map(Number);

            cropedWidth = w;
            cropedHeight = h;

            thumbStats.push({
              baseImgUrl: urlBase,
              startTime: start,
              endTime: end,
              xPos: x,
              yPos: y,
            });
          }

          const result: ScrubThumbStream = {
            cropedHeight: cropedHeight,
            cropedWidth: cropedWidth,
            thumbStats: thumbStats,
          };

          console.log(result);

          return result;
        })
      );
  }
}
