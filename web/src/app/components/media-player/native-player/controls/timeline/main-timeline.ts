import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
  ngOnInit() {}
  ngAfterViewInit() {}
  ngOnDestroy() {}
}
