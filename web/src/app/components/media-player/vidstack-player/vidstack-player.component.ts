import {
  Component,
  Input,
  CUSTOM_ELEMENTS_SCHEMA,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import 'vidstack/player';
import 'vidstack/player/ui';
import 'vidstack/player/layouts/default';
import 'vidstack/player/layouts/plyr';
import 'vidstack/icons';

import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';

import {
  defineCustomElement,
  MediaSliderThumbnailElement,
} from 'vidstack/elements';

defineCustomElement(MediaSliderThumbnailElement);

@Component({
  selector: 'app-vidstack-player',
  standalone: true,
  templateUrl: './vidstack-player.component.html',
  styleUrls: ['./vidstack-player.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
})
export class VidstackPlayerComponent implements AfterViewInit {
  @Input() videoData!: VideoData;

  @ViewChild('mediaPlayer', { static: false }) mediaPlayerRef!: ElementRef;

  isFullscreenOverlay = false;

  private ovaSdk = inject(OVASDK);

  ngAfterViewInit(): void {
    const updateOverlay = () => {
      const isFullscreen = !!document.fullscreenElement;
      this.isFullscreenOverlay = isFullscreen;
    };
    document.addEventListener('fullscreenchange', updateOverlay);
    window.addEventListener('orientationchange', updateOverlay);
  }

  // Get current playback time of the media player
  getCurrentTime(): number {
    const mediaPlayer: any = this.mediaPlayerRef?.nativeElement;
    return mediaPlayer?.currentTime || 0;
  }

  get videoUrl(): string {
    return this.ovaSdk.assets.stream(this.videoData.videoId);
  }

  get thumbnailUrl(): string {
    return this.ovaSdk.assets.thumbnail(this.videoData.videoId);
  }

  get ScrubThumbsUrl(): string {
    return this.ovaSdk.assets.previewVtt(this.videoData.videoId);
  }
}
