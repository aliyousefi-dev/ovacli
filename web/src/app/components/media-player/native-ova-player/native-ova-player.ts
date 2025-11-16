import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  HostListener, // Used to listen for mouse/keyboard events on the host element
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoApiService } from '../../../../services/ova-backend-service/video-api.service';
import { VideoData } from '../../../../services/ova-backend-service/api-types/video-data';
import { ScrubThumbApiService } from '../../../../services/ova-backend-service/scrub-thumb-api.service';
import { ScrubThumbData } from './data-types/scrub-thumb-data';
import { PlayPauseButton } from './controls/buttons/play-pause-button/play-pause-button';
import { MuteButton } from './controls/buttons/mute-button/mute-button';
import { DisplayTime } from './controls/display-time/display-time';
import { MainTimeline } from './controls/timeline/main-timeline';

interface Marker {
  timeSecond: number;
  title: string;
}

@Component({
  selector: 'app-default-video-player',
  standalone: true,
  templateUrl: './native-ova-player.html',
  imports: [
    CommonModule,
    PlayPauseButton,
    MuteButton,
    DisplayTime,
    MainTimeline,
  ],
})
export class NativeOvaPlayer implements AfterViewInit, OnDestroy {
  @Input() videoData!: VideoData;

  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('playerWrap') playerWrap!: ElementRef<HTMLDivElement>;

  currentTime: number = 0;

  // ✨ Controls Visibility State
  controlsVisible: boolean = false;
  private hideControlsTimeout: any;
  private readonly HIDE_DELAY_MS = 3000; // 3 seconds delay

  private videoapi = inject(VideoApiService);
  private scrubThumbApiService = inject(ScrubThumbApiService);
  thumbnailData: ScrubThumbData[] = [];

  // Array of Marker objects
  markersData: Marker[] = [
    { timeSecond: 22, title: 'Introduction' },
    { timeSecond: 60, title: 'Chapter 1: Start' },
    { timeSecond: 2000, title: 'Conclusion' },
  ];

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
    // Using a separate bound function is generally safer for event listeners
    video.addEventListener(
      'loadedmetadata',
      this.onVideoMetadataLoaded.bind(this)
    );

    // Ensure controls are visible initially for a moment
    this.showControls();
  }

  ngOnDestroy() {
    this.clearHideControlsTimeout(); // Ensure timeout is cleared
    if (this.videoRef?.nativeElement) {
      // Remove the event listener using the bound function used for adding it
      this.videoRef.nativeElement.removeEventListener(
        'loadedmetadata',
        this.onVideoMetadataLoaded.bind(this)
      );
    }
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

  // --- Host Listeners for Mouse Events ---

  // When the mouse enters the entire player area, show controls and schedule hide
  @HostListener('mouseenter')
  onMouseEnter() {
    this.showControls();
  }

  // When the mouse moves inside the player area, reset the hide timer
  @HostListener('mousemove')
  onMouseMove() {
    this.showControls();
  }

  // When the mouse leaves the entire player area, hide controls immediately
  @HostListener('mouseleave')
  onMouseLeave() {
    this.clearHideControlsTimeout();
    this.controlsVisible = false;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Only proceed if the event target is NOT an input field (e.g., a search box)
    // to prevent unwanted behavior when typing.
    const target = event.target as HTMLElement;
    const isTyping =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    // Check for Spacebar (key === ' ' or keyCode === 32 for older browsers)
    if (event.key === ' ' && !isTyping) {
      event.preventDefault(); // Prevent the default spacebar action (like scrolling)
      this.togglePlayPause();
    }

    // Optional: Add other keyboard shortcuts here (e.g., 'm' for mute, 'f' for fullscreen)

    // Check for Escape key to hide controls immediately
    if (event.key === 'Escape') {
      this.clearHideControlsTimeout();
      this.controlsVisible = false;
    }
  }

  // --- Existing Logic ---

  private loadScrubThumbnails() {
    this.scrubThumbApiService
      .loadScrubThumbnails(this.videoData.videoId)
      .subscribe({
        next: (thumbnails) => {
          const playerThumbData: ScrubThumbData[] = thumbnails.map((thumb) => ({
            start: thumb.start,
            end: thumb.end,
            url: thumb.url,
            x: thumb.x,
            y: thumb.y,
            w: thumb.w,
            h: thumb.h,
          }));
          this.thumbnailData = playerThumbData;
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
