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
import { VideoApiService } from '../../../../services/ova-backend-service/video-api.service';
import { VideoData } from '../../../../services/ova-backend-service/api-types/video-data';
import { ScrubThumbApiService } from '../../../../services/ova-backend-service/scrub-thumb-api.service';
import { ScrubThumbData } from './data-types/scrub-thumb-data';
import { PlayPauseButton } from './controls/buttons/play-pause-button/play-pause-button';
import { VolumeButton } from './controls/buttons/volume-button/volume-button';
import { DisplayTime } from './controls/display-time/display-time';
import { MainTimeline } from './controls/timeline/main-timeline';
import { MarkerData } from './data-types/marker-data';
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
    DisplayTime,
    MainTimeline,
    PlayerInputHostDirective,
    FullScreenButton,
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

  // ✨ Controls Visibility State
  controlsVisible: boolean = false;
  private hideControlsTimeout: any;
  private readonly HIDE_DELAY_MS = 3000; // 3 seconds delay
  private clickTimeout: any;
  private readonly CLICK_DELAY_MS = 250; // ms used to discriminate singe/double click
  isFullscreen: boolean = false;
  private onVideoMetadataLoadedBound = this.onVideoMetadataLoaded.bind(this);
  private fullscreenChangeHandler = this.onFullscreenChange.bind(this);
  // --- Constant for seek step size (5 seconds) ---

  private videoapi = inject(VideoApiService);
  private scrubThumbApiService = inject(ScrubThumbApiService);
  thumbnailData: ScrubThumbData[] = [];
  private localStorageService = inject(LocalStorageService);

  // Array of Marker objects
  markersData: MarkerData[] = [
    { timeSecond: 22, title: 'Introduction' },
    { timeSecond: 60, title: 'Chapter 1: Start' },
    { timeSecond: 2000, title: 'Conclusion' },
  ];

  private applySavedPreferences() {
    const prefs: OvaPlayerPreferences =
      this.localStorageService.loadPreferences(); // Apply sound level

    this.videoRef.nativeElement.volume = prefs.soundLevel;
  }

  handleHostEvent(event: keyof PlayerHostEvents) {
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

    this.applySavedPreferences();
    // Ensure controls are visible initially for a moment
    this.showControls();

    // Listen to fullscreen change to adjust local state for styling
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
  }

  ngOnDestroy() {
    this.clearHideControlsTimeout(); // Ensure timeout is cleared
    if (this.videoRef?.nativeElement) {
      // Remove the event listener using the bound function used for adding it
      this.videoRef.nativeElement.removeEventListener(
        'loadedmetadata',
        this.onVideoMetadataLoadedBound
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

  /** Handler for when video metadata is loaded. */
  private onVideoMetadataLoaded() {
    console.log('Video metadata loaded.');
  }
}
