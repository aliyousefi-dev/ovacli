import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoApiService } from '../../../../ova-angular-sdk/rest-api/video-api.service';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';
import { ScrubThumbApiService } from '../../../../ova-angular-sdk/rest-api/scrub-thumb-api.service';
import { ScrubThumbData } from './data-types/scrub-thumb-data';
import { PlayPauseButton } from './controls/buttons/play-pause-button/play-pause-button';
import { VolumeButton } from './controls/buttons/volume-button/volume-button';
import { DisplayCurrentTime } from './controls/display-current-time/display-current-time';
import { DisplayTotalTime } from './controls/display-total-time/display-total-time';
import { MainTimeline } from './controls/timeline/main-timeline';
import { MarkerDisplay } from './marker-display/marker-display';
import { FullScreenButton } from './controls/buttons/full-screen/full-screen-button';
import { SettingsButton } from './controls/buttons/settings-button/settings-button';
import {
  PlayerInputHostDirective,
  PlayerHostEvents,
} from './controls/player-input-host';
import { LocalStorageService } from './services/localstorage.service';

@Component({
  selector: 'app-native-player',
  standalone: true,
  templateUrl: './native-player.html',
  imports: [
    CommonModule,
    PlayPauseButton,
    VolumeButton,
    DisplayCurrentTime,
    DisplayTotalTime,
    MainTimeline,
    PlayerInputHostDirective,
    FullScreenButton,
    MarkerDisplay,
    SettingsButton,
  ],
})
export class NativePlayer implements AfterViewInit, OnDestroy {
  @Input() videoData!: VideoData;

  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('playerWrap') playerWrap!: ElementRef<HTMLDivElement>;
  @ViewChild('mainTimelineRef') mainTimelineRef!: MainTimeline;
  @ViewChild('muteButtonRef') muteButtonRef!: VolumeButton;

  videoReady = false;
  controlsVisible = false;
  isFullscreen = false;
  overlayVisible = false;
  isPaused = true;

  rewindVisible = false;
  forwardVisible = false;

  thumbnailData: ScrubThumbData[] = [];

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
  private localStorageService = inject(LocalStorageService);

  // Bind handlers so they can be removed correctly on destroy
  private fullscreenHandler = this.onFullscreenChange.bind(this);

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.loadScrubThumbnails();
    const video = this.videoRef.nativeElement;

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

    this.applySavedPreferences();
    document.addEventListener('fullscreenchange', this.fullscreenHandler);
    this.showControls();
  }

  private initVideoState() {
    this.videoReady = true;
    this.cd.detectChanges();
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

      this.showControls();
    } else {
      this.lastTap = now;
      this.tapTimeout = setTimeout(() => {
        this.controlsVisible
          ? this.hideControlsManually()
          : this.showControls();
      }, this.DOUBLE_TAP_DELAY);
    }
  }

  togglePlayPause() {
    const v = this.videoRef.nativeElement;
    v.paused ? v.play() : v.pause();
    this.cd.detectChanges();
  }

  showControls() {
    this.controlsVisible = true;
    this.cd.detectChanges();
    this.scheduleHideControls();
  }

  private hideControlsManually() {
    this.controlsVisible = false;
    clearTimeout(this.hideControlsTimeout);
    this.cd.detectChanges();
  }

  private scheduleHideControls() {
    clearTimeout(this.hideControlsTimeout);
    if (!this.isPaused) {
      this.hideControlsTimeout = setTimeout(() => {
        this.controlsVisible = false;
        this.cd.detectChanges();
      }, this.HIDE_DELAY_MS);
    }
  }

  private showOverlay() {
    this.overlayVisible = true;
    clearTimeout(this.overlayTimeout);
    this.overlayTimeout = setTimeout(() => {
      this.overlayVisible = false;
      this.cd.detectChanges();
    }, 1000);
    this.cd.detectChanges();
  }

  private stepForward() {
    this.mainTimelineRef?.stepForward();
    this.forwardVisible = true;
    clearTimeout(this.forwardTimeout);
    this.forwardTimeout = setTimeout(() => {
      this.forwardVisible = false;
      this.cd.detectChanges();
    }, this.ICON_FLASH_MS);
    this.cd.detectChanges();
  }

  private stepBackward() {
    this.mainTimelineRef?.stepBackward();
    this.rewindVisible = true;
    clearTimeout(this.rewindTimeout);
    this.rewindTimeout = setTimeout(() => {
      this.rewindVisible = false;
      this.cd.detectChanges();
    }, this.ICON_FLASH_MS);
    this.cd.detectChanges();
  }

  handleInputs(event: keyof PlayerHostEvents) {
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
        this.muteButtonRef?.volumeLevelUp();
        break;
      case 'volumeDown':
        this.muteButtonRef?.volumeLevelDown();
        break;
    }
  }

  get videoUrl() {
    return this.videoapi.getStreamUrl(this.videoData.videoId);
  }
  get thumbnailUrl() {
    return this.videoapi.getThumbnailUrl(this.videoData.videoId);
  }

  private applySavedPreferences() {
    const prefs = this.localStorageService.loadPreferences();
    if (this.videoRef) this.videoRef.nativeElement.volume = prefs.soundLevel;
  }

  private onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement;
    this.cd.detectChanges();
  }

  private loadScrubThumbnails() {
    this.scrubThumbApiService
      .loadScrubThumbnails(this.videoData.videoId)
      .subscribe((thumbnails) => {
        this.thumbnailData = thumbnails;
        this.cd.detectChanges();
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
