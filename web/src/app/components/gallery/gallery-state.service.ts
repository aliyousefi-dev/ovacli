import { Injectable, inject } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { VideoData } from '../../../ova-angular-sdk/core-types/video-data';
import { GalleryFetchFn, GalleryViewMode } from './types';
import { take } from 'rxjs';

@Injectable()
export class GalleryStateService {
  private videosSubject = new BehaviorSubject<VideoData[]>([]);
  public videos$ = this.videosSubject.asObservable();

  private viewModeSubject = new BehaviorSubject<GalleryViewMode>(
    'infinite-scroll',
  );
  public viewMode$ = this.viewModeSubject.asObservable();

  private totalPagesSubject = new BehaviorSubject<number>(0);

  public totalPages$ = this.totalPagesSubject.asObservable();

  private totalVideosSubject = new BehaviorSubject<number>(0);
  public totalVideos$ = this.totalVideosSubject.asObservable();

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

    this.activeFetchFn(page)
      .pipe(take(1))
      .subscribe((response) => {
        const newVideos = response.videos ?? [];

        this.totalPagesSubject.next(response.totalPages);
        this.totalVideosSubject.next(response.totalItems);

        if (append) {
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
