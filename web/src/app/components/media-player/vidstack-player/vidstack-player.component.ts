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

import { AssetMap } from '../../../../ova-angular-sdk/rest-api/api-assets';

import {
  defineCustomElement,
  MediaSliderThumbnailElement,
} from 'vidstack/elements';

defineCustomElement(MediaSliderThumbnailElement);

import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';
import { VideoApiService } from '../../../../ova-angular-sdk/rest-api/video-api.service';

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

  private videoapi = inject(VideoApiService);
  private assetMap = inject(AssetMap);

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
    return this.assetMap.stream(this.videoData.videoId);
  }

  get thumbnailUrl(): string {
    return this.assetMap.thumbnail(this.videoData.videoId);
  }

  get ScrubThumbsUrl(): string {
    return this.assetMap.previewVtt(this.videoData.videoId);
  }
}
