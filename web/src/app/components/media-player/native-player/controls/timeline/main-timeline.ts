import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressTrack } from './progress-track/progress-track.component';
import { BufferedTrack } from './buffered-track/buffered-track';
import { MarkerTrack } from './marker-track/marker-track';
import { MarkerData } from '../../data-types/marker-data';

import { ScrubPreview } from './scrub-preview/scrub-preview';
import { ScrubThumbData } from '../../data-types/scrub-thumb-data';

@Component({
  selector: 'app-main-timeline',
  standalone: true,

  imports: [
    CommonModule,
    ProgressTrack,
    BufferedTrack,
    MarkerTrack,
    ScrubPreview,
  ],
  templateUrl: './main-timeline.html',
})
export class MainTimeline implements OnInit, OnDestroy, AfterViewInit {
  /**
   * Input: The reference to the actual <video> element from the parent component.
   */
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @Input() scrubThumbData!: ScrubThumbData[];
  @Input() markersData!: MarkerData[];
  // Reference to the timeline container to get its width
  @ViewChild('timelineRef', { read: ElementRef })
  timelineRef!: ElementRef<HTMLDivElement>;

  @ViewChild('progressTrack') progressTrackRef!: ProgressTrack;

  isScrubPreviewVisible: boolean = false;
  scrubTime: number = 0;
  scrubXPositionPercent: number = 0;
  // Pixel X position of the scrub within the timelineRef (used to position preview accurately)
  scrubXPositionPx: number = 0;
  progressTrackLeftPx: number = 0;
  progressTrackWidthPx: number = 0;

  // NEW: Stores the pixel width of the timeline for clamping calculations
  timelineWidthPx: number = 0;
  private resizeHandler = this.updateTimelineWidth.bind(this);
  private fullscreenChangeHandler = this.updateTimelineWidth.bind(this);
  private readonly SEEK_STEP = 15;

  // Inject ChangeDetectorRef so we can safely notify Angular of property changes
  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {}

  // Capture the initial width of the timeline element after the view is initialized
  ngAfterViewInit() {
    // Check for timelineRef existence, necessary since it's used in template with @if
    if (this.timelineRef) {
      // Initialize timeline width + related offsets (uses progressTrack if available)
      this.updateTimelineWidth();
      // Listen for window resize to update timeline width if the element resizes (including fullscreen changes)
      window.addEventListener('resize', this.resizeHandler);
      document.addEventListener(
        'fullscreenchange',
        this.fullscreenChangeHandler
      );
    }
  }

  ngOnDestroy() {}

  // Handler for scrubMove event emitted by ProgressTrack (DRAG SCRUBBING)
  onScrubMove(data: { time: number; xPercent: number; clientX?: number }) {
    this.isScrubPreviewVisible = true;
    this.scrubTime = data.time;
    this.scrubXPositionPercent = data.xPercent;
    if (
      typeof data.clientX === 'number' &&
      this.timelineRef &&
      this.progressTrackRef
    ) {
      const timelineRect =
        this.timelineRef.nativeElement.getBoundingClientRect();
      const trackRect =
        this.progressTrackRef.trackContainerRef.nativeElement.getBoundingClientRect();
      this.scrubXPositionPx = Math.round(data.clientX - timelineRect.left);
      this.progressTrackLeftPx = Math.round(trackRect.left - timelineRect.left);
      this.progressTrackWidthPx = Math.round(trackRect.width);
      // Trigger change detection after we mutate pixel-bound properties so Angular's
      // subsequent change-check cycle doesn't detect unexpected mid-cycle updates.
      this.cd.detectChanges();
    }
  }

  private updateTimelineWidth() {
    if (this.progressTrackRef && this.progressTrackRef.trackContainerRef) {
      // Prefer the actual track container width which is used to compute clientX percentages
      const rect =
        this.progressTrackRef.trackContainerRef.nativeElement.getBoundingClientRect();
      this.timelineWidthPx = Math.round(rect.width);
      // Also compute left offset and width relative to timeline
      if (this.timelineRef && this.timelineRef.nativeElement) {
        const timelineRect =
          this.timelineRef.nativeElement.getBoundingClientRect();
        this.progressTrackLeftPx = Math.round(rect.left - timelineRect.left);
      }
      this.progressTrackWidthPx = Math.round(rect.width);
      // Ensure the UI updates synchronously to avoid ExpressionChangedAfterItHasBeenCheckedError
      this.cd.detectChanges();
      return;
    }
    if (this.timelineRef && this.timelineRef.nativeElement) {
      this.timelineWidthPx = Math.round(
        this.timelineRef.nativeElement.getBoundingClientRect().width
      );
      this.cd.detectChanges();
    }
  }

  // Handler for scrubEnd event emitted by ProgressTrack
  onScrubEnd() {
    this.isScrubPreviewVisible = false;
  }

  stepForward() {
    const video = this.videoRef.nativeElement;
    const newTime = video.currentTime + this.SEEK_STEP;

    // Use the exposed method on ProgressTrack to perform the seek
    this.progressTrackRef.seekToTime(newTime);
  }

  /** Moves the video's playback position backward by SEEK_STEP seconds. */
  stepBackward() {
    const video = this.videoRef.nativeElement;
    const newTime = video.currentTime - this.SEEK_STEP;

    // Use the exposed method on ProgressTrack to perform the seek
    this.progressTrackRef.seekToTime(newTime);
  }
}
