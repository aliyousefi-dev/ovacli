import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';

import { GalleryStateService } from '../../components/gallery/gallery-state.service';
import { GalleryFetchFn } from '../../components/gallery/types';

import { GalleryPreview } from '../../components/gallery/gallery-preview/gallery-preview';

@Component({
  selector: 'app-saved-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GalleryPreview],
  providers: [GalleryStateService],
  templateUrl: './saved.page.html',
})
export class SavedPage implements OnInit {
  private galleryState = inject(GalleryStateService);
  private ovaSdk = inject(OVASDK);

  ngOnInit(): void {
    const fetchProxy: GalleryFetchFn = (page: number) => {
      return this.ovaSdk.saved
        .getUserSaved(page)
        .pipe(map((response) => response.data));
    };

    this.galleryState.setFetchStrategy(fetchProxy);
  }
}
