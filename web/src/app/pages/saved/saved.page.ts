import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryFetcherComponent } from '../../components/gallery/gallery-fetcher/gallery-fetcher.component';
import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';

import {
  GalleryStateService,
  GalleryFetchFn,
} from '../../components/gallery/gallery-state.service';

@Component({
  selector: 'app-saved-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GalleryFetcherComponent],
  templateUrl: './saved.page.html',
})
export class SavedPage implements OnInit {
  private galleryState = inject(GalleryStateService);
  private ovaSdk = inject(OVASDK);

  ngOnInit(): void {
    const fetchProxy: GalleryFetchFn = (bucket: number) => {
      this.ovaSdk.saved.getUserSaved(0);

      return 0;
    };

    this.galleryState.setFetchStrategy(fetchProxy);
  }
}
