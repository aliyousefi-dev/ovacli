import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../../services/ova-backend-service/api-types/video-data'; // Assuming path
import { VideoApiService } from '../../../services/ova-backend-service/video-api.service'; // Assuming path
import { Router } from '@angular/router';

@Component({
  selector: 'app-similar-videos-panel', // Changed selector
  standalone: true,
  imports: [CommonModule],
  templateUrl: './similar-videos-panel.component.html',
  styles: [],
})
export class SimilarVideosPanelComponent implements OnChanges {
  // Changed class name
  @Input() currentVideoId!: string;

  similarVideos: VideoData[] = [];
  similarVideosLoading = false;
  similarVideosError = false;

  constructor(public videoapi: VideoApiService, private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentVideoId'] && this.currentVideoId) {
      this.loadSimilarVideos(this.currentVideoId);
    }
  }

  loadSimilarVideos(videoId: string) {
    this.similarVideosLoading = true;
    this.similarVideosError = false;
    this.similarVideos = []; // Clear previous similar videos

    this.videoapi.getSimilarVideos(videoId).subscribe({
      next: (res) => {
        this.similarVideos = res.data.similarVideos || [];
        this.similarVideosLoading = false;
      },
      error: () => {
        this.similarVideosLoading = false;
        this.similarVideosError = true;
      },
    });
  }

  navigateToVideo(videoId: string) {
    // Navigate to the video detail page
    this.router.navigate(['/watch', videoId], { replaceUrl: true }).then(() => {
      // Force the page to reload after navigation
      window.location.reload();
    });
  }
}
