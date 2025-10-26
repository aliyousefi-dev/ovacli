import { Component, Input, OnInit } from '@angular/core';
import { VideoCardComponent } from '../../blocks/video-card/video-card.component';
import { MiniVideoCardComponent } from '../../blocks/mini-video-card/mini-video-card.component';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../../../services/ova-backend-service/api-types/video-data';

@Component({
  selector: 'app-gallery-view',
  standalone: true,
  imports: [CommonModule, VideoCardComponent, MiniVideoCardComponent],
  templateUrl: './gallery-view.component.html',
})
export class GalleryViewComponent {
  @Input() videos: VideoData[] = [];
  @Input() ViewMode: string = 'mini';
  @Input() PreviewPlayback: boolean = false;
}
