import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OVASDK } from '../../../../../ova-angular-sdk/ova-sdk';
import { GalleryPreview } from '../../../../components/gallery/gallery-preview/gallery-preview';
import { GalleryStateService } from '../../../../components/gallery/gallery-state.service';
import { GalleryFetchFn, SortMode } from '../../../../components/gallery/types';
import { map } from 'rxjs';

@Component({
  selector: 'app-global-videos',
  templateUrl: './global-videos.component.html',
  standalone: true,
  providers: [GalleryStateService],
  imports: [CommonModule, GalleryPreview],
})
export class GlobalVideosComponent implements OnInit {
  private ovaSdk = inject(OVASDK);
  private galleryState = inject(GalleryStateService);

  ngOnInit(): void {
    const fetchProxy: GalleryFetchFn = (page: number, sortMode?: SortMode) => {
      return this.ovaSdk.global
        .fetchGlobalVideos(page, sortMode)
        .pipe(map((response) => response.data));
    };

    this.galleryState.setFetchStrategy(fetchProxy);
  }

  constructor() {}
}
