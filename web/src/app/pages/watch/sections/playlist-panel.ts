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

  timeSinceAdded(time: string): string {
    const addedDate = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - addedDate.getTime();
    if (diffMs < 0) return 'just now';

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30); // Approximation, as months vary in length
    const years = Math.floor(months / 12);

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
    if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    return 'just now';
  }
}
