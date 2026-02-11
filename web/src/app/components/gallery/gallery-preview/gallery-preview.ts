import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GalleryViewMode } from '../types';
import { GalleryStateService } from '../gallery-state.service';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';
import { GalleryViewComponent } from '../gallery-view/gallery-view.component';

@Component({
  selector: 'gallery-preview',
  standalone: true,
  imports: [CommonModule, RouterModule, GalleryViewComponent],
  templateUrl: './gallery-preview.html',
})
export class GalleryPreview implements OnInit {
  galleryService = inject(GalleryStateService);

  videos: VideoData[] = [];
  viewMode: GalleryViewMode = 'infinite-scroll';

  ngOnInit(): void {
    this.galleryService.viewMode$.subscribe((mode) => {
      this.viewMode = mode;
    });

    this.galleryService.videos$.subscribe((videos) => {
      this.videos = videos;
    });

    this.galleryService.loadPage(1);
  }
}
