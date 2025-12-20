import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryInfiniteFetcher } from '../gallery-infinite-fetcher/gallery-infinite-fetcher.component';
import { GalleryPageFetcher } from '../gallery-page-fetcher/gallery-page-fetcher.component';
import { AppSettingsService } from '../../../../app-settings/app-settings.service';
import { Input } from '@angular/core';

@Component({
  selector: 'app-gallery-fetcher',
  standalone: true,
  imports: [
    CommonModule,
    GalleryInfiniteFetcher,
    GalleryPageFetcher,
    FormsModule,
  ],
  templateUrl: './gallery-fetcher.component.html',
})
export class GalleryFetcherComponent implements OnInit {
  @Input() routeCategory: string = 'recent';
  @Input() slug: string = '';

  loading = true;
  username: string | null = null;
  infiniteMode = true; // Default to infinite mode, you can change based on preference
  previewPlayback = true; // Default for preview playback
  isMiniView = false; // Default to full view

  private appSettings = inject(AppSettingsService);

  ngOnInit() {
    this.appSettings.settings$.subscribe((settings) => {
      this.infiniteMode = settings.GalleryInfiniteMode;
      this.isMiniView = settings.GalleryMiniCardViewMode;
      this.previewPlayback = settings.GalleryPreviewPlayback;
    });
  }
}
