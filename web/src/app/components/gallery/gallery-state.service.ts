import { Injectable, inject } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { VideoData } from '../../../ova-angular-sdk/core-types/video-data';
import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';

@Injectable({
  providedIn: 'root',
})
export class GalleryStateService {
  private videos$ = new BehaviorSubject<VideoData[]>([]);
  public stream$ = this.videos$.asObservable();

  private ovaSdk = inject(OVASDK);

  loadMore() {}
}
