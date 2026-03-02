import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-video-title-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './video-title-bar.component.html',
})
export class VideoTitleBarComponent {
  @Input() videoData!: VideoData;

  get timeSinceAdded(): string {
    if (!this.videoData.uploadedAt) return 'unknown';

    const addedDate = new Date(this.videoData.uploadedAt);
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
