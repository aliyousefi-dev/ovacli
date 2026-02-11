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

  currentPage: number = 1;
  totalPages: number = 0;
  totalVideos: number = 0;

  ngOnInit(): void {
    this.galleryService.viewMode$.subscribe((mode) => {
      this.viewMode = mode;
    });

    this.galleryService.videos$.subscribe((videos) => {
      this.videos = videos;
    });

    this.galleryService.totalPages$.subscribe((t) => {
      this.totalPages = t;
    });

    this.galleryService.totalVideos$.subscribe((t) => {
      this.totalVideos = t;
    });

    this.galleryService.loadPage(this.currentPage);
  }

  clear() {
    this.galleryService.clear();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.galleryService.loadPage(this.currentPage);
    }
  }

  nextPage() {
    console.log('click');
    this.currentPage++;
    this.galleryService.loadPage(this.currentPage);
  }
}
