import { Injectable, inject } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { VideoData } from '../../ova-angular-sdk/core-types/video-data';
import { GlobalVideosService } from '../../ova-angular-sdk/rest-api/global-api.service';

@Injectable({
  providedIn: 'root',
})
export class GalleryStateService {
  private videos$ = new BehaviorSubject<VideoData[]>([]);
  public stream$ = this.videos$.asObservable();

  globals = inject(GlobalVideosService);

  loadMore() {
    this.globals.fetchGlobalVideos(1);
    this.globals.fetchGlobalVideos(2);
  }
}
