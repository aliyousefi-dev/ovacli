import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
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

  // NEW: Stores the pixel width of the timeline for clamping calculations
  timelineWidthPx: number = 0;
  private readonly SEEK_STEP = 5;

  ngOnInit() {}

  // Capture the initial width of the timeline element after the view is initialized
  ngAfterViewInit() {
    // Check for timelineRef existence, necessary since it's used in template with @if
    if (this.timelineRef) {
      this.timelineWidthPx = this.timelineRef.nativeElement.offsetWidth;
    }
  }

  ngOnDestroy() {}

  // Handler for scrubMove event emitted by ProgressTrack (DRAG SCRUBBING)
  onScrubMove(data: { time: number; xPercent: number }) {
    this.isScrubPreviewVisible = true;
    this.scrubTime = data.time;
    this.scrubXPositionPercent = data.xPercent;
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
