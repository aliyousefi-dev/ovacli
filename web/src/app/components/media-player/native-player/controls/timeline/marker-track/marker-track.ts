import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkerData } from '../../../data-types/marker-data';
import { TimeTagService } from '../../../services/time-tag.service';
import { PlayerStateService } from '../../../services/player-state.service';

@Component({
  selector: 'app-marker-track',
  standalone: true,
  templateUrl: './marker-track.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkerTrack implements OnInit, OnDestroy, AfterViewInit {
  markersData: MarkerData[] = [];
  @ViewChild('markers') markersRef!: ElementRef<HTMLDivElement>;

  private timeTagService = inject(TimeTagService);
  private playerState = inject(PlayerStateService);

  ngOnInit() {
    this.timeTagService.timeTags$.subscribe((data) => {
      this.markersData = data;
      this.renderMarkers();
    });
  }

  ngAfterViewInit() {
    this.renderMarkers();
  }

  ngOnDestroy() {}

  /**
   * Renders the chapter/key point markers onto the timeline track.
   */
  private renderMarkers = () => {
    if (!this.markersRef || !this.markersData.length) {
      return;
    }

    const videoDuration = this.playerState.duration$.value;
    const timelineElement = this.markersRef.nativeElement;

    // Clear existing markers before re-rendering
    timelineElement.innerHTML = '';

    if (videoDuration && videoDuration > 0) {
      this.markersData.forEach((markerData) => {
        const { timeSecond } = markerData;

        // Calculate the position percentage
        const pct = (timeSecond / videoDuration) * 100;

        // Create the marker element as a raw HTML string for efficient rendering
        const markerHTML = `
  <div 
    class=" absolute h-full w-1 bg-red-600 cursor-pointer transition-transform hover:scale-x-500 "
    style="left: ${pct}%; "
  ></div>
`;

        timelineElement.innerHTML += markerHTML;
      });
    } else {
      console.warn(
        'Video duration is not available yet for rendering markers.',
      );
    }
  };
}
