import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatTime } from '../../../utils/time-utils';
import { MarkerData } from '../../../data-types/marker-data';
import { ScrubThumbData } from '../../../data-types/scrub-thumb-data';

@Component({
  selector: 'app-scrub-preview',
  standalone: true,
  templateUrl: './scrub-preview.html',
  imports: [CommonModule],
})
export class ScrubPreview implements OnChanges {
  @Input({ required: true }) isVisible: boolean = false;
  @Input({ required: true }) markers: MarkerData[] = [];
  @Input({ required: true }) timeInSeconds: number = 0;
  @Input({ required: true }) scrubThumbData: ScrubThumbData[] = [];
  @Input({ required: true }) scrubXPositionPercent: number = 0;

  // NEW INPUT: Timeline width in pixels for accurate clamping
  @Input() timelineWidthPx: number = 0;

  formatTime = formatTime;
  previewImageStyles: any = { opacity: '0' };
  markerTitle: string = '';

  // Internal state for the current width of the thumbnail (defaulted to 160px for consistent clamping)
  private currentPreviewWidthPx: number = 160;
  private readonly PROXIMITY_THRESHOLD = 60;

  ngOnChanges() {
    this.updatePreview();
  }

  // Calculates the final `left` CSS position, ensuring the popup stays within the timeline bounds.
  get clampedLeftPosition(): string {
    if (this.timelineWidthPx === 0) {
      // Fallback: If we don't know the width, use the raw percentage (but the centering will be off)
      return `${this.scrubXPositionPercent}%`;
    }

    // 1. Convert the ideal scrub center position (%) to pixels
    const idealCenterPx =
      (this.scrubXPositionPercent / 100) * this.timelineWidthPx;

    // 2. Calculate the required left edge position based on the element's width
    const halfWidth = this.currentPreviewWidthPx / 2;
    const unclampedLeftPx = idealCenterPx - halfWidth;

    // 3. Clamp the position
    const maxLeftPx = this.timelineWidthPx - this.currentPreviewWidthPx;

    // Clamp the pixel value between 0 and the max allowable left position
    const clampedLeftPx = Math.max(0, Math.min(unclampedLeftPx, maxLeftPx));

    // 4. Convert the final clamped pixel value back to a percentage
    const clampedLeftPercent = (clampedLeftPx / this.timelineWidthPx) * 100;

    return `${clampedLeftPercent}%`;
  }

  // Update the thumbnail preview based on current time
  private updatePreview() {
    const TILE_FRAME_COUNT = 5;

    const cue = this.scrubThumbData.find(
      (thumb) =>
        this.timeInSeconds >= thumb.start && this.timeInSeconds < thumb.end
    );

    if (cue) {
      // CRITICAL: Update the internal width used for clamping
      this.currentPreviewWidthPx = cue.w;

      // 1. Calculate the percentage of time passed within the current cue's duration
      const cueTimeElapsed = this.timeInSeconds - cue.start;
      const cueDuration = cue.end - cue.start;
      const percentInCue = cueTimeElapsed / cueDuration;

      // 2. Determine which of the 5 frames to show
      const frameIndex = Math.floor(percentInCue * TILE_FRAME_COUNT);

      // 3. Calculate the horizontal offset (in pixels) required to move the background
      const frameXOffset = frameIndex * cue.w;

      // 4. Calculate the total background position
      const totalBackgroundXOffset = cue.x + frameXOffset;

      // Set the visual styles (applied only to the inner image div)
      this.previewImageStyles = {
        opacity: '1',
        backgroundImage: `url(${cue.url})`,
        width: `${cue.w}px`,
        height: `${cue.h}px`,
        backgroundPosition: `-${totalBackgroundXOffset}px -${cue.y}px`,
        backgroundSize: `${cue.w * TILE_FRAME_COUNT}px auto`,
      };
    } else {
      // Reset to default width when no cue is present
      this.currentPreviewWidthPx = 160;
      this.previewImageStyles.opacity = '0';
    }
  }

  // Check if current time is near any marker
  get nearMarker(): MarkerData | undefined {
    if (!this.markers || this.markers.length === 0) {
      return undefined;
    }

    return this.markers.find((marker) => {
      const diff = Math.abs(marker.timeSecond - this.timeInSeconds);
      return diff <= this.PROXIMITY_THRESHOLD;
    });
  }
}
