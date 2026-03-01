import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GalleryViewMode } from '../types';
import { GalleryStateService } from '../gallery-state.service';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';
import { PaginationComponent } from '../pagination/pagination';
import { MiniVideoCardComponent } from '../mini-video-card/mini-video-card';
import { SortMode } from '../types';

@Component({
  selector: 'gallery-preview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MiniVideoCardComponent,
    PaginationComponent,
  ],
  templateUrl: './gallery-preview.html',
})
export class GalleryPreview implements OnInit {
  galleryService = inject(GalleryStateService);

  videos: VideoData[] = [];
  viewMode: GalleryViewMode = 'infinite-scroll';

  currentSortOrder: SortMode = 'title_asc';
  currentPage: number = 1;
  totalPages: number = 0;
  totalVideos: number = 0;
  loadedVideos: number = 0;

  sortVideos(order: SortMode): void {
    this.currentSortOrder = order;
    this.reload();
  }

  handleNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.galleryService.loadPage(this.currentPage, this.currentSortOrder);
    }
  }

  handlePrev() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.galleryService.loadPage(this.currentPage, this.currentSortOrder);
    }
  }

  handleGoToPage(num: number) {
    this.goToPage(num);
  }

  ngOnInit(): void {
    this.galleryService.viewMode$.subscribe((mode) => {
      this.viewMode = mode;
    });

    this.galleryService.videos$.subscribe((videos) => {
      this.loadedVideos = videos.length;
      this.videos = videos;
    });

    this.galleryService.totalPages$.subscribe((t) => {
      this.totalPages = t;
    });

    this.galleryService.totalVideos$.subscribe((t) => {
      this.totalVideos = t;
    });

    this.galleryService.fetchStrategyChanged$.subscribe(() => {
      this.galleryService.loadPage(this.currentPage, this.currentSortOrder);
    });
  }

  clear() {
    this.galleryService.clearVideos();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.galleryService.loadPage(this.currentPage, this.currentSortOrder);
    }
  }

  reload() {
    this.goToPage(this.currentPage);
  }

  nextPage() {
    console.log('click');
    this.currentPage++;
    this.galleryService.loadPage(this.currentPage, this.currentSortOrder);
  }

  loadMore() {
    this.currentPage++;
    this.galleryService.loadPage(this.currentPage, this.currentSortOrder, true);
  }
}
