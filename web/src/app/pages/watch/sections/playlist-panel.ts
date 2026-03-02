import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';

@Component({
  selector: 'app-playlist-panel', // Changed selector
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playlist-panel.html',
  styles: [],
})
export class PlaylistWatchPanel implements OnInit {
  // Changed class name
  @Input() playlistVideos!: VideoData[];

  ovaSdk = inject(OVASDK);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  selectedVideoId: string = ' ';

  navigate(videoId: string) {
    this.router.navigate(['/watch'], {
      queryParams: { video: videoId },
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const videoId = params['video'];

      this.selectedVideoId = videoId;
    });
  }

  formatTime(seconds: number): string {
    // Guard against invalid input – we keep the same “00:00” fallback.
    if (isNaN(seconds) || seconds < 0) {
      return '00:00';
    }

    // Round to the nearest whole second
    const totalSeconds = Math.round(seconds);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    // Pad each part with leading zeros
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(secs).padStart(2, '0');

    // If there are no hours, drop the leading "00:" part
    return hours > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  }
}
