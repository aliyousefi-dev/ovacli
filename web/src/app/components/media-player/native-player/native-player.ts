import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoApiService } from '../../../../ova-angular-sdk/rest-api/video-api.service';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';
import { ScrubThumbApiService } from '../../../../ova-angular-sdk/rest-api/scrub-thumb-api.service';
import { PlayPauseButton } from './controls/buttons/play-pause-button/play-pause-button';
import { VolumeButton } from './controls/volume-button/volume-button';
import { DisplayCurrentTime } from './controls/display-current-time/display-current-time';
import { DisplayTotalTime } from './controls/display-total-time/display-total-time';
import { MainTimeline } from './controls/timeline/main-timeline';
import { MarkerDisplay } from './marker-display/marker-display';
import { FullScreenButton } from './controls/buttons/full-screen/full-screen-button';
import { SettingsButton } from './controls/buttons/settings-button/settings-button';
import { ScreenDebugger } from './debugger/debugger';
import { TimeTagButton } from './controls/buttons/time-tag-button/time-tag-button';
import { ScrubImageComponent } from './scrub-image/scrub-image';
import { ScrubThumbStream } from './data-types/scrub-thumb-data';
import { PlayerStateService } from './services/player-state.service';
import { PlayerUIService } from './services/player-ui.service';
import { TimeTagService } from './services/time-tag.service';

import {
  PlayerInputHostDirective,
  PlayerHostEvents,
} from './controls/player-input-host';

@Component({
  selector: 'app-native-player',
  standalone: true,
  templateUrl: './native-player.html',
  imports: [
    ScrubImageComponent,
    CommonModule,
    PlayPauseButton,
    VolumeButton,
    DisplayCurrentTime,
    DisplayTotalTime,
    MainTimeline,
    PlayerInputHostDirective,
    FullScreenButton,
    ScreenDebugger,
    MarkerDisplay,
    SettingsButton,
    TimeTagButton,
  ],
})
export class NativePlayer implements AfterViewInit, OnDestroy {
  @Input() videoData!: VideoData;

  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('playerWrap') playerWrap!: ElementRef<HTMLDivElement>;
  @ViewChild('mainTimelineRef') mainTimelineRef!: MainTimeline;

  videoReady = false;
  controlsVisible = false;
  isFullscreen = false;
  overlayVisible = false;
  isPaused = true;

  rewindVisible = false;
  forwardVisible = false;

  thumbnailData: ScrubThumbStream = {
    cropedWidth: 0,
    cropedHeight: 0,
    thumbStats: [],
  };

  nativeplayerViewInit = false;

  private hideControlsTimeout: any;
  private overlayTimeout: any;
  private rewindTimeout: any;
  private forwardTimeout: any;
  private lastTap = 0;
  private tapTimeout: any;

  private readonly HIDE_DELAY_MS = 3000;
  private readonly DOUBLE_TAP_DELAY = 300;
  private readonly ICON_FLASH_MS = 800;

  private videoapi = inject(VideoApiService);
  private scrubThumbApiService = inject(ScrubThumbApiService);
  private playerState = inject(PlayerStateService);
  private playerUi = inject(PlayerUIService);
  private timeTagService = inject(TimeTagService);

  // Bind handlers so they can be removed correctly on destroy
  private fullscreenHandler = this.onFullscreenChange.bind(this);

  ngAfterViewInit() {
    this.nativeplayerViewInit = true;
    this.loadScrubThumbnails();
    const video = this.videoRef.nativeElement;

    this.playerState.init(this.videoRef);
    this.playerUi.init(this.playerWrap);
    this.timeTagService.init(this.videoData.videoId);

    console.log('natvie view init');
    // Handle metadata loading for markers/timeline
    if (video.readyState >= 1) {
      this.initVideoState();
    } else {
      video.addEventListener('loadedmetadata', () => this.initVideoState());
    }

    video.addEventListener('play', () => {
      this.isPaused = false;
      this.showOverlay();
      this.scheduleHideControls();
    });

    video.addEventListener('pause', () => {
      this.isPaused = true;
      this.showOverlay();
      this.showControls();
    });

    document.addEventListener('fullscreenchange', this.fullscreenHandler);
    this.showControls();
  }

  private initVideoState() {
    this.videoReady = true;
  }

  handleCenterTap(event: MouseEvent) {
    event.stopPropagation();
    this.togglePlayPause();
    this.showControls();
  }

  handleTouch(event: TouchEvent) {
    event.stopPropagation();
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTap;

    if (timeSinceLastTap < this.DOUBLE_TAP_DELAY) {
      clearTimeout(this.tapTimeout);
      this.lastTap = 0;

      const touchX = event.touches[0].clientX;
      const screenWidth = window.innerWidth;

      if (touchX < screenWidth / 2) this.stepBackward();
      else this.stepForward();
    } else {
      this.lastTap = now;
      this.tapTimeout = setTimeout(() => {}, this.DOUBLE_TAP_DELAY);
    }
  }

  togglePlayPause() {
    const v = this.videoRef.nativeElement;
    v.paused ? v.play() : v.pause();
  }

  showControls() {
    this.controlsVisible = true;
    this.scheduleHideControls();
  }

  private scheduleHideControls() {
    clearTimeout(this.hideControlsTimeout);
    if (!this.isPaused) {
      this.hideControlsTimeout = setTimeout(() => {
        this.controlsVisible = false;
      }, this.HIDE_DELAY_MS);
    }
  }

  private showOverlay() {
    this.overlayVisible = true;
    clearTimeout(this.overlayTimeout);
    this.overlayTimeout = setTimeout(() => {
      this.overlayVisible = false;
    }, 1000);
  }

  private stepForward() {
    this.playerState.stepForward();
    this.forwardVisible = true;
    clearTimeout(this.forwardTimeout);
    this.forwardTimeout = setTimeout(() => {
      this.forwardVisible = false;
    }, this.ICON_FLASH_MS);
  }

  private stepBackward() {
    this.playerState.stepBackward();
    this.rewindVisible = true;
    clearTimeout(this.rewindTimeout);
    this.rewindTimeout = setTimeout(() => {
      this.rewindVisible = false;
    }, this.ICON_FLASH_MS);
  }

  handleInputs(event: keyof PlayerHostEvents) {
    let volumeDefultStep = 0.01;
    let volumeDefultShiftStep = 0.05;

    this.showControls();
    switch (event) {
      case 'playPauseToggle':
        this.togglePlayPause();
        break;
      case 'stepForward':
        this.stepForward();
        break;
      case 'stepBackward':
        this.stepBackward();
        break;
      case 'volumeUp':
        this.playerState.setVolume(
          this.playerState.volume$.value + volumeDefultStep
        );
        break;
      case 'shiftVolumeUp':
        this.playerState.setVolume(
          this.playerState.volume$.value + volumeDefultShiftStep
        );
        break;
      case 'volumeDown':
        this.playerState.setVolume(
          this.playerState.volume$.value - volumeDefultStep
        );
        break;
      case 'shiftVolumeDown':
        this.playerState.setVolume(
          this.playerState.volume$.value - volumeDefultShiftStep
        );
        break;
    }
  }

  get videoUrl() {
    return this.videoapi.getStreamUrl(this.videoData.videoId);
  }
  get thumbnailUrl() {
    return this.videoapi.getThumbnailUrl(this.videoData.videoId);
  }

  private onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement;
  }

  private loadScrubThumbnails() {
    this.scrubThumbApiService
      .loadScrubThumbnails(this.videoData.videoId)
      .subscribe((thumbnails) => {
        this.thumbnailData = thumbnails;
      });
  }

  ngOnDestroy() {
    clearTimeout(this.hideControlsTimeout);
    clearTimeout(this.overlayTimeout);
    clearTimeout(this.tapTimeout);
    clearTimeout(this.rewindTimeout);
    clearTimeout(this.forwardTimeout);
    document.removeEventListener('fullscreenchange', this.fullscreenHandler);
  }
}
