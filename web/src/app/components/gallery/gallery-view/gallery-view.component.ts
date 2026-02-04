import { Component, Input } from '@angular/core';
import { VideoCardComponent } from '../video-card/video-card';
import { MiniVideoCardComponent } from '../mini-video-card/mini-video-card';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';

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
