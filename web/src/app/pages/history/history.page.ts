import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GalleryPreview } from '../../components/gallery/gallery-preview/gallery-preview';
import { GalleryFetchFn } from '../../components/gallery/types';
import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';
import { map } from 'rxjs';
import { GalleryStateService } from '../../components/gallery/gallery-state.service';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GalleryPreview],
  providers: [GalleryStateService],
  templateUrl: './history.page.html',
})
export class HistoryPage implements OnInit {
  private ovaSdk = inject(OVASDK);
  private galleryState = inject(GalleryStateService);

  ngOnInit(): void {
    const fetchProxy: GalleryFetchFn = (page: number) => {
      return this.ovaSdk.history
        .getUserWatched(page)
        .pipe(map((response) => response.data));
    };

    this.galleryState.setFetchStrategy(fetchProxy);
  }
}
