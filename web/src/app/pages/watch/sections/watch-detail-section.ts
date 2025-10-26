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

  formatTime(seconds: number | null | undefined): string {
    if (seconds == null || isNaN(seconds)) return '–';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
}
