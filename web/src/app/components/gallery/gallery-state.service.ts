import { Injectable, inject } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { VideoData } from '../../../ova-angular-sdk/core-types/video-data';
import { Observable } from 'rxjs';

export type GalleryFetchFn = (bucket: number) => number;

@Injectable({
  providedIn: 'root',
})
export class GalleryStateService {
  private videos$ = new BehaviorSubject<VideoData[]>([]);
  public stream$ = this.videos$.asObservable();

  private activeFetchFn?: GalleryFetchFn;

  setFetchStrategy(fn: GalleryFetchFn) {
    this.activeFetchFn = fn;
  }

  loadFirstPage() {}

  loadPage(page: number) {
    if (!this.activeFetchFn) {
      console.error('No fetch strategy provided to GalleryStateService');
      return;
    }
  }

  clear() {
    this.videos$.next([]);
  }
}
