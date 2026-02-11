import { Injectable, inject } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { VideoData } from '../../../ova-angular-sdk/core-types/video-data';
import { GalleryFetchFn, GalleryViewMode } from './types';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GalleryStateService {
  private videosSubject = new BehaviorSubject<VideoData[]>([]);
  public videos$ = this.videosSubject.asObservable();

  private viewModeSubject = new BehaviorSubject<GalleryViewMode>(
    'infinite-scroll',
  );
  public viewMode$ = this.viewModeSubject.asObservable();

  private activeFetchFn?: GalleryFetchFn;

  setFetchStrategy(fn: GalleryFetchFn) {
    this.activeFetchFn = fn;
  }

  setViewMode(mode: GalleryViewMode) {
    this.viewModeSubject.next(mode);
  }

  loadPage(page: number, append?: boolean) {
    if (!this.activeFetchFn) {
      console.error('No fetch strategy provided');
      return;
    }

    const viewMode = this.viewModeSubject.getValue();
    const shouldAppend = append ?? (viewMode === 'infinite-scroll' && page > 1);

    this.activeFetchFn(page)
      .pipe(take(1))
      .subscribe((response) => {
        const newVideos = response.videos ?? [];
        if (shouldAppend) {
          const currentVideos = this.videosSubject.getValue();
          this.videosSubject.next([...currentVideos, ...newVideos]);
        } else {
          this.videosSubject.next(newVideos);
        }
      });
  }
  
  clear() {
    this.videosSubject.next([]);
  }
}
