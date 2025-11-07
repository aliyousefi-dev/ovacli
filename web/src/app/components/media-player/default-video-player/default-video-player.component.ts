import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { VideoData } from '../../../../services/ova-backend-service/api-types/video-data';
import { VideoApiService } from '../../../../services/ova-backend-service/video-api.service';

@Component({
  selector: 'app-default-video-player',
  standalone: true,
  templateUrl: './default-video-player.component.html',
  imports: [CommonModule],
})
export class DefaultVideoPlayerComponent implements AfterViewInit {
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;

  @Input() videoData!: VideoData;

  markerPercents: number[] = [];
  private videoapi = inject(VideoApiService);

  ngAfterViewInit() {
    const videoElement = this.videoRef?.nativeElement;
    if (!videoElement) return;

    const storedMute = localStorage.getItem('isMuted');
    videoElement.muted = storedMute === 'true';
    videoElement.removeEventListener('volumechange', this.onVolumeChange);
    videoElement.addEventListener('volumechange', this.onVolumeChange);
  }

  get videoUrl(): string {
    return this.videoapi.getStreamUrl(this.videoData.videoId);
  }

  get thumbnailUrl(): string {
    return this.videoapi.getThumbnailUrl(this.videoData.videoId);
  }
  onVolumeChange = () => {
    const videoElement = this.videoRef?.nativeElement;
    if (!videoElement) return;
    localStorage.setItem('isMuted', String(videoElement.muted));
  };
}
