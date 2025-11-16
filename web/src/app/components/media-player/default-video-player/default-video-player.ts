import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  HostListener, // <-- Import HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoApiService } from '../../../../services/ova-backend-service/video-api.service';
import { VideoData } from '../../../../services/ova-backend-service/api-types/video-data';
import { ScrubThumbApiService } from '../../../../services/ova-backend-service/scrub-thumb-api.service';
import { ScrubThumbData } from './data-types/scrub-thumb-data';
import { PlayPauseButton } from './buttons/play-pause-button/play-pause-button';
import { MuteButton } from './buttons/mute-button/mute-button';
import { DisplayTime } from './components/display-time/display-time';
import { MainTimeline } from './timeline/main-timeline';
import { formatTime } from './utils/time-utils';

interface BufferedRange {
  start: number;
  end: number;
}

interface Marker {
  timeSecond: number;
  title: string;
}

@Component({
  selector: 'app-default-video-player',
  standalone: true,
  templateUrl: './default-video-player.html',
  imports: [
    CommonModule,
    PlayPauseButton,
    MuteButton,
    DisplayTime,
    MainTimeline,
  ],
})
export class DefaultVideoPlayer implements AfterViewInit, OnDestroy {
  @Input() videoData!: VideoData;

  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  // ... (Removed unused @ViewChild properties for brevity, keep them if needed elsewhere)
  @ViewChild('playerWrap') playerWrap!: ElementRef<HTMLDivElement>;

  currentTime: number = 0;
  bufferedWidth: number = 0;

  // ✨ NEW: Control visibility state
  controlsVisible: boolean = false;
  // ✨ NEW: Timer for auto-hiding the controls
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
    video.addEventListener('loadedmetadata', this.onVideoMetadataLoaded);

    // ✨ NEW: Ensure controls are visible initially for a moment
    this.showControls();
  }

  ngOnDestroy() {
    this.clearHideControlsTimeout(); // Ensure timeout is cleared
    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.removeEventListener(
        'loadedmetadata',
        this.onVideoMetadataLoaded
      );
    }
  }

  // --- Controls Visibility Logic ---

  /** Clears the existing timeout. */
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

  // --- Host Listeners for Mouse Events (Replaces template event bindings) ---

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

  // --- Existing Logic ---

  private loadScrubThumbnails() {
    // ... (existing logic remains the same)
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

  private onVideoMetadataLoaded = () => {};

  get isPlaying() {
    return this.videoRef?.nativeElement?.paused === false;
  }

  get videoDuration() {
    return this.videoRef?.nativeElement?.duration || 0;
  }

  get isMuted() {
    return this.videoRef?.nativeElement?.muted === true;
  }

  get soundLevel(): number {
    return this.videoRef?.nativeElement?.volume || 0;
  }
}
