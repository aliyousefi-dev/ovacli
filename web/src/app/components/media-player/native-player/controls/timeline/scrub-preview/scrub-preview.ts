import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatTime } from '../../../utils/time-utils';
import { MarkerData } from '../../../data-types/marker-data';
import { ScrubThumbStream } from '../../../data-types/scrub-thumb-data';

@Component({
  selector: 'app-scrub-preview',
  standalone: true,
  templateUrl: './scrub-preview.html',
  imports: [CommonModule],
})
export class ScrubPreview implements OnChanges {
  /* ---------- Existing inputs ---------- */
  @Input({ required: true }) isVisible: boolean = false;
  @Input({ required: true }) markers: MarkerData[] = [];
  @Input({ required: true }) timeInSeconds: number = 0;
  @Input({ required: true }) scrubXPositionPercent: number = 0;
  @Input() scrubXPositionPx: number = 0;

  @Input({ required: true }) scrubThumbStream: ScrubThumbStream = {
    cropedWidth: 0,
    cropedHeight: 0,
    thumbStats: [],
  };

  /** Timeline width in pixels – used for clamping the popup. */
  @Input() timelineWidthPx: number = 0;
  /** Optional preview scale (1 = native, >1 = enlarged). */
  @Input() previewScale: number = 1.5;

  /* ---------- Derived helpers ---------- */
  formatTime = formatTime;
  previewImageStyles: any = { opacity: '0' };
  markerTitle: string = '';

  /* ---------- Internal state ---------- */
  /** Current width (in px) of the preview box – updated on every change. */
  public currentPreviewWidthPx: number = 160;
  private readonly PROXIMITY_THRESHOLD = 60; // px to check for “near” markers
  private readonly TILE_FRAME_COUNT = 5; // frames in a sprite sheet

  /* ---------- Angular lifecycle ---------- */
  ngOnChanges() {
    this.updatePreview();
  }

  /* ---------- Style helpers ---------- */
  get previewWidthPx(): number {
    return this.currentPreviewWidthPx;
  }

  /** Returns a pixel value that guarantees the preview stays inside the timeline. */
  get clampedLeftPositionPx(): number {
    if (this.timelineWidthPx === 0) {
      return Math.max(
        0,
        Math.round(this.scrubXPositionPx - this.currentPreviewWidthPx / 2)
      );
    }

    const halfWidth = this.currentPreviewWidthPx / 2;
    const unclampedLeftPx = this.scrubXPositionPx - halfWidth;

    const maxLeftPx = this.timelineWidthPx - this.currentPreviewWidthPx;
    return Math.round(Math.max(0, Math.min(unclampedLeftPx, maxLeftPx)));
  }

  /* ---------- Core logic ---------- */
  private updatePreview() {
    const stream = this.scrubThumbStream;
    const { cropedWidth, cropedHeight, thumbStats } = stream;

    /* 1️⃣ Find the cue that covers the current time. */
    const exactCue = thumbStats.find(
      (thumb) =>
        this.timeInSeconds >= thumb.startTime &&
        this.timeInSeconds < thumb.endTime
    );

    /* 2️⃣ If we don't have an exact cue, fallback to the most recent
       or the very first cue (same logic that existed before). */
    let displayCue = exactCue;
    let displayFrameIndex = 0;

    if (!displayCue && thumbStats.length > 0) {
      /* → latest cue that starts at or before the current time */
      const prevCue = thumbStats
        .filter((t) => t.startTime <= this.timeInSeconds)
        .sort((a, b) => b.startTime - a.startTime)[0];

      if (prevCue) {
        displayCue = prevCue;
        if (this.timeInSeconds >= prevCue.endTime) {
          /* → show the last frame if we’re past the cue */
          displayFrameIndex = this.TILE_FRAME_COUNT - 1;
        } else {
          /* → compute which frame inside the cue duration we’re on */
          const elapsed = this.timeInSeconds - prevCue.startTime;
          const duration = prevCue.endTime - prevCue.startTime;
          const percentInCue = elapsed / duration;
          displayFrameIndex = Math.floor(percentInCue * this.TILE_FRAME_COUNT);
        }
      } else {
        /* → before the first thumbnail – show the very first cue */
        displayCue = thumbStats[0];
        displayFrameIndex = 0;
      }
    }

    /* 3️⃣ Update the preview (style + width) if a cue was found. */
    if (displayCue) {
      /* Internal width used for clamping the popup. */
      this.currentPreviewWidthPx = Math.round(cropedWidth * this.previewScale);

      /* Which frame to show? */
      const frameIndex =
        displayCue === exactCue
          ? Math.floor(
              ((this.timeInSeconds - displayCue.startTime) /
                (displayCue.endTime - displayCue.startTime)) *
                this.TILE_FRAME_COUNT
            )
          : displayFrameIndex;

      /* Horizontal offset of the background sprite. */
      const frameXOffset = frameIndex * cropedWidth;
      const totalBackgroundXOffset = displayCue.xPos + frameXOffset;

      /* Set visual styles. */
      this.previewImageStyles = {
        opacity: '1',
        backgroundImage: `url(${displayCue.baseImgUrl})`,
        width: `${Math.round(cropedWidth * this.previewScale)}px`,
        height: `${Math.round(cropedHeight * this.previewScale)}px`,
        backgroundPosition: `-${Math.round(
          totalBackgroundXOffset * this.previewScale
        )}px -${Math.round(displayCue.yPos * this.previewScale)}px`,
        backgroundSize: `${Math.round(
          cropedWidth * this.TILE_FRAME_COUNT * this.previewScale
        )}px auto`,
      };
    } else {
      /* No cue → hide preview and fall back to a default width. */
      this.currentPreviewWidthPx = Math.round(160 * this.previewScale);
      this.previewImageStyles.opacity = '0';
    }
  }

  /* ---------- Marker helper ---------- */
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
