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
  // Pixel position (px) of the scrub/cursor within the timelineRef's coordinate space
  @Input() scrubXPositionPx: number = 0;

  // NEW INPUT: Timeline width in pixels for accurate clamping
  @Input() timelineWidthPx: number = 0;
  // Optional scale factor for the thumbnail preview (1 for native size, >1 for larger preview)
  @Input() previewScale: number = 1.5;

  formatTime = formatTime;
  previewImageStyles: any = { opacity: '0' };
  markerTitle: string = '';

  // Internal state for the current width of the thumbnail (defaulted to 160px for consistent clamping)
  public currentPreviewWidthPx: number = 160;
  private readonly PROXIMITY_THRESHOLD = 60;

  ngOnChanges() {
    this.updatePreview();
  }

  get previewWidthPx(): number {
    return this.currentPreviewWidthPx;
  }

  // Calculates the final `left` CSS position (as pixel value), ensuring the popup stays within the timeline bounds.
  get clampedLeftPositionPx(): number {
    // If we don't have a known timeline width or timeline px, return a default offset
    if (this.timelineWidthPx === 0) {
      return Math.max(
        0,
        Math.round(this.scrubXPositionPx - this.currentPreviewWidthPx / 2)
      );
    }

    // Ideal center position (px) within the timeline (already computed by main-timeline)
    const idealCenterPx = this.scrubXPositionPx;

    // Calculate the required left edge position based on the element's width
    const halfWidth = this.currentPreviewWidthPx / 2;
    const unclampedLeftPx = idealCenterPx - halfWidth;

    // Clamp the position inside the timeline width
    const maxLeftPx = this.timelineWidthPx - this.currentPreviewWidthPx;
    const clampedLeftPx = Math.max(0, Math.min(unclampedLeftPx, maxLeftPx));

    return Math.round(clampedLeftPx);
  }

  // Update the thumbnail preview based on current time
  private updatePreview() {
    const TILE_FRAME_COUNT = 5;

    const cue = this.scrubThumbData.find(
      (thumb) =>
        this.timeInSeconds >= thumb.start && this.timeInSeconds < thumb.end
    );

    // If no cue exists for this exact time, try to fallback to the most recent
    // cue that starts at or before the current time, and if that doesn't exist
    // use the first available cue as a last-resort fallback. This ensures the
    // preview shows an image instead of being hidden when there is no exact
    // cue for the current time.
    let displayCue = cue;
    let displayFrameIndex = 0;

    if (!displayCue && this.scrubThumbData && this.scrubThumbData.length > 0) {
      // Find the latest cue that starts at or before the current time
      const prevCue = this.scrubThumbData
        .filter((thumb) => thumb.start <= this.timeInSeconds)
        .sort((a, b) => b.start - a.start)[0];

      if (prevCue) {
        displayCue = prevCue;
        // If we're past the end of the cue, show the last frame, otherwise
        // compute a frame index within the cue duration.
        if (this.timeInSeconds >= prevCue.end) {
          displayFrameIndex = TILE_FRAME_COUNT - 1;
        } else {
          const cueTimeElapsed = this.timeInSeconds - prevCue.start;
          const cueDuration = prevCue.end - prevCue.start;
          const percentInCue = cueTimeElapsed / cueDuration;
          displayFrameIndex = Math.floor(percentInCue * TILE_FRAME_COUNT);
        }
      } else {
        // No previous cue (we're before the first thumbnail), use the first
        // cue's first frame so the user still sees a preview instead of none.
        displayCue = this.scrubThumbData[0];
        displayFrameIndex = 0;
      }
    }

    if (displayCue) {
      // CRITICAL: Update the internal width used for clamping
      this.currentPreviewWidthPx = Math.round(displayCue.w * this.previewScale);

      // 2. Determine which of the 5 frames to show
      const frameIndex =
        displayCue === cue
          ? Math.floor(
              ((this.timeInSeconds - displayCue.start) /
                (displayCue.end - displayCue.start)) *
                TILE_FRAME_COUNT
            )
          : displayFrameIndex;

      // 3. Calculate the horizontal offset (in pixels) required to move the background
      const frameXOffset = frameIndex * displayCue.w;

      // 4. Calculate the total background position
      const totalBackgroundXOffset = displayCue.x + frameXOffset;

      // Set the visual styles (applied only to the inner image div)
      this.previewImageStyles = {
        opacity: '1',
        backgroundImage: `url(${displayCue.url})`,
        width: `${Math.round(displayCue.w * this.previewScale)}px`,
        height: `${Math.round(displayCue.h * this.previewScale)}px`,
        backgroundPosition: `-${Math.round(
          totalBackgroundXOffset * this.previewScale
        )}px -${Math.round(displayCue.y * this.previewScale)}px`,
        backgroundSize: `${Math.round(
          displayCue.w * TILE_FRAME_COUNT * this.previewScale
        )}px auto`,
      };
    } else {
      // Reset to default width when no cue is present
      this.currentPreviewWidthPx = Math.round(160 * this.previewScale);
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
