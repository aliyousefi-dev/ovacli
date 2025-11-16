// src/app/components/default-video-player/video-timeline/video-tracks/marker-track/marker-track.component.ts

import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkerData } from '../../data-types/marker-data';

@Component({
  selector: 'app-marker-track',
  standalone: true,
  templateUrl: './marker-track.component.html',
  imports: [CommonModule],
})
export class MarkerTrackComponent implements OnChanges {
  @Input({ required: true }) markersData: MarkerData[] = [];
  @Input({ required: true }) duration: number = 0;

  @ViewChild('markersContainer') markersContainer!: ElementRef<HTMLDivElement>;

  ngOnChanges(changes: SimpleChanges): void {
    // Only re-render if data or duration changes and duration is valid
    if ((changes['markersData'] || changes['duration']) && this.duration > 0) {
      this.renderMarkers();
    }
  }

  private renderMarkers() {
    const timelineElement = this.markersContainer.nativeElement;
    timelineElement.innerHTML = ''; // Clear existing markers

    this.markersData.forEach((markerData) => {
      const { timeSecond, title } = markerData;
      const pct = (timeSecond / this.duration) * 100;

      if (pct >= 0 && pct <= 100) {
        const markerElement = document.createElement('div');
        markerElement.classList.add(
          'timeline-marker',
          'tooltip',
          'tooltip-bottom'
        );
        markerElement.setAttribute('data-tip', title);

        // Embedded Styles
        Object.assign(markerElement.style, {
          position: 'absolute',
          left: `${pct}%`,
          top: '0',
          transform: 'translateX(-50%)',
          width: '3px',
          height: '100%',
          backgroundColor: 'red',
          zIndex: '10',
        });

        timelineElement.appendChild(markerElement);
      }
    });
  }
}
