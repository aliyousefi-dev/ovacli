import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';
import { VideoApiService } from '../../../../ova-angular-sdk/rest-api/video-api.service';
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
    this.router.navigate(['/watch', videoId]);
  }
}
