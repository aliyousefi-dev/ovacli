import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../../data-types/video-data';

@Component({
  selector: 'app-video-title-bar',
  standalone: true,
  imports: [CommonModule],
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

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }
}
