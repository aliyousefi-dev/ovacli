import { Injectable } from '@angular/core';

import { OnInit } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { VideoData } from '../../../ova-angular-sdk/core-types/video-data';
import { GalleryFetchFn, GalleryViewMode } from './types';
import { take } from 'rxjs';
import { SortMode } from './types';

@Injectable()
export class GalleryStateService implements OnInit {
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

  private fetchStrategyChanged = new BehaviorSubject<void>(undefined);
  public fetchStrategyChanged$ = this.fetchStrategyChanged.asObservable();

  private activeFetchFn?: GalleryFetchFn;

  ngOnInit(): void {}

  setFetchStrategy(fn: GalleryFetchFn) {
    this.activeFetchFn = fn;
    this.fetchStrategyChanged.next();
  }

  setViewMode(mode: GalleryViewMode) {
    this.viewModeSubject.next(mode);
  }

  loadPage(page: number, sortMode?: SortMode, append?: boolean) {
    if (!this.activeFetchFn) {
      console.error('No fetch strategy provided');
      return;
    }

    this.activeFetchFn(page, sortMode)
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

  clearVideos() {
    this.videosSubject.next([]);
  }
}
