import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TagLinkComponent } from '../../../components/utility/tag-link/tag-link.component';
import { VideoData } from '../../../../services/ova-backend-service/api-types/video-data';

@Component({
  selector: 'app-watch-detail-section',
  standalone: true,
  imports: [CommonModule, TagLinkComponent],
  templateUrl: './watch-detail-section.html',
})
export class WatchDetailSection {
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

  formatTime(seconds: number | null | undefined): string {
    if (seconds == null || isNaN(seconds)) return '–';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
}
