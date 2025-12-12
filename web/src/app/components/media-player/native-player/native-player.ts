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
import { OvaPlayerPreferences } from './data-types/player-preferences-data';

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

  currentTime: number = 0;

  // Signals template children are ready to render, set after the video's ViewChild is initialized
  videoReady: boolean = false;

  // ✨ Controls Visibility State
  controlsVisible: boolean = false;
  private hideControlsTimeout: any;
  private readonly HIDE_DELAY_MS = 3000; // 3 seconds delay
  private clickTimeout: any;
  private readonly CLICK_DELAY_MS = 250; // ms used to discriminate singe/double click
  isFullscreen: boolean = false;
  // Overlay visibility state used for center play/pause animation
  overlayVisible: boolean = false;
  private overlayTimeout: any;
  private readonly OVERLAY_DURATION_MS = 1000; // 1 second duration
  // local property to reflect the video's paused state for ngClass swap-active
  isPaused: boolean = true;
  private onVideoMetadataLoadedBound = this.onVideoMetadataLoaded.bind(this);
  private onVideoPlayBound = this.onVideoPlay.bind(this);
  private onVideoPauseBound = this.onVideoPause.bind(this);
  private fullscreenChangeHandler = this.onFullscreenChange.bind(this);
  // --- Constant for seek step size (5 seconds) ---

  private videoapi = inject(VideoApiService);
  private scrubThumbApiService = inject(ScrubThumbApiService);
  thumbnailData: ScrubThumbData[] = [];
  private localStorageService = inject(LocalStorageService);

  constructor(private cd: ChangeDetectorRef) {}

  private applySavedPreferences() {
    const prefs: OvaPlayerPreferences =
      this.localStorageService.loadPreferences(); // Apply sound level

    this.videoRef.nativeElement.volume = prefs.soundLevel;
  }

  handleInputs(event: keyof PlayerHostEvents) {
    switch (event) {
      case 'playPauseToggle':
        this.showControls();
        this.togglePlayPause();
        break;
      case 'showControls':
        this.showControls();
        break;
      case 'hideControls':
        break;
      case 'stepForward':
        this.showControls();
        this.mainTimelineRef.stepForward();
        break;
      case 'stepBackward':
        this.showControls();
        this.mainTimelineRef.stepBackward();
        break;
      case 'volumeUp':
        this.showControls();
        this.muteButtonRef.volumeLevelUp();
        break;
      case 'volumeDown':
        this.showControls();
        this.muteButtonRef.volumeLevelDown();
        break;
    }
  }

  get videoUrl() {
    return this.videoapi.getStreamUrl(this.videoData.videoId);
  }

  get thumbnailUrl() {
    return this.videoapi.getThumbnailUrl(this.videoData.videoId);
  }

  async ngAfterViewInit() {
    this.loadScrubThumbnails();

    const video = this.videoRef.nativeElement;
    this.currentTime = video.currentTime;

    // Wait until the video's metadata is loaded before proceeding with other logic
    // Use the stored bound function to ensure removal will work later
    video.addEventListener('loadedmetadata', this.onVideoMetadataLoadedBound);

    // keep a simple isPaused boolean in sync with the video's state
    this.isPaused = video.paused;
    video.addEventListener('play', this.onVideoPlayBound);
    video.addEventListener('pause', this.onVideoPauseBound);

    this.applySavedPreferences();
    // Ensure controls are visible initially for a moment.
    // Wrap in a macrotask to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.showControls());

    // Listen to fullscreen change to adjust local state for styling
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);

    // Child controls rely on the presence of the video ElementRef; expose a flag
    // so the template can defer rendering children until the ViewChild is set.
    this.videoReady = true;
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.clearHideControlsTimeout(); // Ensure timeout is cleared
    this.clearOverlayTimeout();
    if (this.videoRef?.nativeElement) {
      // Remove the event listener using the bound function used for adding it
      this.videoRef.nativeElement.removeEventListener(
        'loadedmetadata',
        this.onVideoMetadataLoadedBound
      );
      this.videoRef.nativeElement.removeEventListener(
        'play',
        this.onVideoPlayBound
      );
      this.videoRef.nativeElement.removeEventListener(
        'pause',
        this.onVideoPauseBound
      );
    }
    // remove fullscreen listener
    document.removeEventListener(
      'fullscreenchange',
      this.fullscreenChangeHandler
    );
  }

  // --- NEW: Play/Pause on Video Click Logic ---

  /** Toggles the video between play and pause. Called on video click. */
  togglePlayPause() {
    const video = this.videoRef.nativeElement; // This uses the ElementRef's native element
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
    this.showControls();
    this.showOverlay();
  }

  /** Handle single click with a small delay so double click can be detected. */
  onSingleClick() {
    // schedule a click action and store timer id
    this.clearClickTimeout();
    this.clickTimeout = setTimeout(() => {
      this.togglePlayPause();
      this.clickTimeout = null;
    }, this.CLICK_DELAY_MS);
  }

  /** Handle double click - cancel any pending single click timer and toggle fullscreen. */
  onDoubleClick(evt?: Event) {
    if (evt) evt.preventDefault();
    this.clearClickTimeout();
    this.toggleFullScreen();
  }

  private clearClickTimeout() {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }
  }

  toggleFullScreen() {
    const containerElement = this.playerWrap.nativeElement;
    if (this.isFullscreen && document.exitFullscreen) {
      document.exitFullscreen();
    } else if (containerElement.requestFullscreen) {
      containerElement.requestFullscreen();
    }
  }

  private onFullscreenChange() {
    // set local state; ensures the video and container classes update
    this.isFullscreen =
      !!document.fullscreenElement &&
      document.fullscreenElement === this.playerWrap?.nativeElement;
  }

  /** Shows overlay and schedules hiding after fixed duration. */
  private showOverlay() {
    this.overlayVisible = true;
    this.clearOverlayTimeout();
    this.overlayTimeout = setTimeout(() => {
      this.overlayVisible = false;
      this.overlayTimeout = null;
      this.cd.detectChanges();
    }, this.OVERLAY_DURATION_MS);
    this.cd.detectChanges();
  }

  private clearOverlayTimeout() {
    if (this.overlayTimeout) {
      clearTimeout(this.overlayTimeout);
      this.overlayTimeout = null;
    }
  }

  // --- Controls Visibility Logic ---

  /** Clears the existing timeout for hiding controls. */
  private clearHideControlsTimeout() {
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
      this.hideControlsTimeout = null;
    }
  }

  /** Shows controls and sets a timer to hide them. */
  showControls() {
    this.controlsVisible = true;
    this.scheduleHideControls();
  }

  /** Schedules the controls to hide after the delay. */
  private scheduleHideControls() {
    this.clearHideControlsTimeout();
    this.hideControlsTimeout = setTimeout(() => {
      this.controlsVisible = false;
    }, this.HIDE_DELAY_MS);
  }

  private loadScrubThumbnails() {
    this.scrubThumbApiService
      .loadScrubThumbnails(this.videoData.videoId)
      .subscribe({
        next: (thumbnails) => {
          this.thumbnailData = thumbnails;
        },
        error: (err) => {
          console.error('Error loading scrub thumbnails:', err);
        },
      });
  }

  private onVideoPlay() {
    this.isPaused = false;
    this.showOverlay();
  }

  private onVideoPause() {
    this.isPaused = true;
    this.showOverlay();
  }

  /** Handler for when video metadata is loaded. */
  private onVideoMetadataLoaded() {
    console.log('Video metadata loaded.');
  }
}
