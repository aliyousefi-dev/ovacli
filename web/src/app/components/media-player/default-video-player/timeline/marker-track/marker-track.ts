import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkerData } from '../../data-types/marker-data';

@Component({
  selector: 'app-marker-track',
  standalone: true,
  templateUrl: './marker-track.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkerTrack implements OnInit, OnDestroy {
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @Input({ required: true }) markersData!: MarkerData[];

  @ViewChild('markers') markersRef!: ElementRef<HTMLDivElement>;

  private video!: HTMLVideoElement;

  ngOnInit() {
    if (this.videoRef && this.videoRef.nativeElement) {
      this.video = this.videoRef.nativeElement;

      // Ensure markers are rendered only when video duration is available
      this.video.addEventListener('loadedmetadata', this.renderMarkers);

      // Initial check, in case metadata was already loaded
      if (isFinite(this.video.duration) && this.video.duration > 0) {
        this.renderMarkers();
      }
    }
  }

  ngOnDestroy() {
    if (this.video) {
      this.video.removeEventListener('loadedmetadata', this.renderMarkers);
    }
  }

  /**
   * Renders the chapter/key point markers onto the timeline track.
   */
  private renderMarkers = () => {
    if (!this.video || !this.markersRef || !this.markersData.length) {
      return;
    }

    const videoDuration = this.video.duration;
    const timelineElement = this.markersRef.nativeElement;

    // Clear existing markers before re-rendering
    timelineElement.innerHTML = '';

    if (videoDuration && videoDuration > 0) {
      this.markersData.forEach((markerData) => {
        const { timeSecond, title } = markerData;

        // Calculate the position percentage
        const pct = (timeSecond / videoDuration) * 100;

        // Create the marker element as a raw HTML string for efficient rendering
        const markerHTML = `
          <div 
            class="timeline-marker absolute h-full w-1 bg-red-600 cursor-pointer transition-transform hover:scale-y-150 tooltip tooltip-bottom"
            data-tip="${title}"
            style="left: ${pct}%; transform: translateX(-50%);"
          ></div>
        `;

        timelineElement.innerHTML += markerHTML;
      });
    } else {
      console.warn(
        'Video duration is not available yet for rendering markers.'
      );
    }
  };
}
