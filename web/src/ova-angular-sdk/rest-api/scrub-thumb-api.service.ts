import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ScrubThumbStat,
  ScrubThumbStream,
} from '../core-types/scrub-thumb-data';

import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class ScrubThumbApiService {
  private http = inject(HttpClient);
  private apiMap = inject(ApiMap);

  /** Convert "HH:MM:SS" → seconds */
  private timeToSeconds(time: string): number {
    const [h, m, s] = time.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }

  /** Load scrub‑thumbnails and wrap them in a `ScrubThumbStream`. */
  loadScrubThumbnails(videoId: string): Observable<ScrubThumbStream> {
    const url = this.apiMap.previews.scrubVtt(videoId);

    return this.http.get(url, { responseType: 'text' }).pipe(
      map((vtt: string) => {
        const blocks = vtt.split('\n\n').filter((b) => b.trim() !== '');

        const thumbStats: ScrubThumbStat[] = [];
        let cropedWidth = 0;
        let cropedHeight = 0;

        /* ---------- 1️⃣  Find sprite boundaries ---------------- */
        let maxRight = 0; // max(x + w)
        let maxBottom = 0; // max(y + h)
        let spriteImgSrc = '';

        for (const block of blocks) {
          const lines = block.split('\n');
          if (lines.length < 2) continue;

          // ---------- 1a. Parse the timing ----------
          const [start, end] = lines[0].split(' --> ').map(this.timeToSeconds);

          // ---------- 1b. Parse the URL & coordinates ----------
          const [urlBase, coords] = lines[1].split('#xywh=');
          const [x, y, w, h] = coords.split(',').map(Number);

          // Crop size is the *same* for every block, so we just keep the last one.
          cropedWidth = w;
          cropedHeight = h;

          // Update the “sprite” envelope.
          const right = x + w;
          const bottom = y + h;
          if (right > maxRight) maxRight = right;
          if (bottom > maxBottom) maxBottom = bottom;

          // Collect the stat that the preview component needs.
          thumbStats.push({
            baseImgUrl: urlBase,
            startTime: start,
            endTime: end,
            xPos: x,
            yPos: y,
          });

          // Keep the first image source – we’ll load it only once.
          if (!spriteImgSrc) spriteImgSrc = urlBase;
        }

        // ---- 2️⃣  The *expected* sprite size from coordinates  ----
        const stream: ScrubThumbStream = {
          cropedWidth,
          cropedHeight,
          spriteWidth: maxRight, // x + w  of the furthest tile
          spriteHeight: maxBottom, // y + h  of the furthest tile
          thumbStats,
        };

        return stream; // ← return right away if you’re happy with the coords
      }),
    );
  }
}
