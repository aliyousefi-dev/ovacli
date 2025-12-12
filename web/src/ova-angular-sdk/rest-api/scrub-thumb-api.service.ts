import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScrubThumbData } from '../core-types/scrub-thumb-data';
import { environment } from '../../environments/environment';
import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class ScrubThumbApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  // Convert time in HH:MM:SS format to seconds
  private timeToSeconds(time: string): number {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  getScrubThumbsUrl(videoId: string): string {
    return `${this.config.apiBaseUrl}/preview-thumbnails/${videoId}/thumbnails.vtt`;
  }

  // Method to load scrub thumbnails from a VTT file URL
  loadScrubThumbnails(videoId: string): Observable<ScrubThumbData[]> {
    return this.http
      .get(this.getScrubThumbsUrl(videoId), { responseType: 'text' })
      .pipe(
        map((vtt: string) => {
          const blocks = vtt.split('\n\n');
          const scrubThumbnails: ScrubThumbData[] = [];

          for (const block of blocks) {
            const lines = block.split('\n');
            if (lines.length < 2) continue;

            const [start, end] = lines[0]
              .split(' --> ')
              .map(this.timeToSeconds);
            const [urlBase, coords] = lines[1].split('#xywh=');
            const [x, y, w, h] = coords.split(',').map(Number);

            scrubThumbnails.push({ start, end, url: urlBase, x, y, w, h });
          }

          return scrubThumbnails;
        })
      );
  }
}
