import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressTrack } from './progress-track/progress-track.component';
import { BufferedTrack } from './buffered-track/buffered-track';
import { MarkerTrack } from './marker-track/marker-track';

import { ScrubPreview } from './scrub-preview/scrub-preview';
import { ScrubThumbStream } from '../../data-types/scrub-thumb-data';
import { ScrubTimelineService } from '../../services/scrub-timeline.service';

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
  @Input() scrubThumbData!: ScrubThumbStream;

  // NEW: Stores the pixel width of the timeline for clamping calculations
  timelineWidthPx: number = 0;

  ngOnInit() {}

  // Capture the initial width of the timeline element after the view is initialized
  ngAfterViewInit() {}

  ngOnDestroy() {}
}
