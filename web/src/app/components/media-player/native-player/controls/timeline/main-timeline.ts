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

@Component({
  selector: 'app-main-timeline',
  standalone: true,

  imports: [CommonModule, ProgressTrack, BufferedTrack, MarkerTrack],
  templateUrl: './main-timeline.html',
})
export class MainTimeline implements OnInit, OnDestroy, AfterViewInit {
  // NEW: Stores the pixel width of the timeline for clamping calculations
  timelineWidthPx: number = 0;

  ngOnInit() {}

  // Capture the initial width of the timeline element after the view is initialized
  ngAfterViewInit() {}

  ngOnDestroy() {}
}
