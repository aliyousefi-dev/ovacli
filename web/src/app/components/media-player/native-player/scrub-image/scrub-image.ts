import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ScrubThumbStream } from '../data-types/scrub-thumb-data';
import { PlayerStateService } from '../services/player-state.service';

@Component({
  selector: 'app-scrub-image',
  templateUrl: './scrub-image.html',
  imports: [CommonModule],
})
export class ScrubImageComponent implements OnInit, OnDestroy {
  /** ---- Public API --------------------------------------- */
  @Input({ required: true }) scrubThumbStream!: ScrubThumbStream;

  /** ---- Internal state ----------------------------------- */
  previewVisible = false; // shown only when previewSrc is set
  scaledW = 0; // width that the preview image will occupy
  scaledH = 0; // height that the preview image will occupy
  previewSrc = ''; // data‑URL produced by the off‑screen canvas

  /** ---- Dependencies ----------------------------------- */
  private readonly playerState = inject(PlayerStateService);

  /** ---- Private helpers --------------------------------- */
  private currentTime = 0;
  private timeSub?: Subscription;
  private spriteImg: HTMLImageElement | null = null; // cached sprite sheet
  private readonly offscreenCanvas: HTMLCanvasElement =
    document.createElement('canvas'); // never attached to DOM

  /** ---- Lifecycle ------------------------------------- */
  ngOnInit(): void {
    // subscribe to the global time stream
    this.timeSub = this.playerState.currentTime$.subscribe((time) => {
      this.currentTime = time;
      this.updatePreview();
    });
  }

  ngOnDestroy(): void {
    this.timeSub?.unsubscribe();
  }

  /** ---- Public API ------------------------------------- */
  /** Called from the template – keeps the template tidy. */
  get imgStyle(): { width: number; height: number } {
    return { width: this.scaledW, height: this.scaledH };
  }

  /** ---- Core preview logic ----------------------------- */
  private async updatePreview(): Promise<void> {
    const stream = this.scrubThumbStream;
    if (!stream?.thumbStats?.length) {
      this.clearPreview();
      return;
    }

    const { cropedWidth, cropedHeight, thumbStats } = stream;

    // 1. Find the frame that contains the current time
    const cue = thumbStats.find(
      (f) => this.currentTime >= f.startTime && this.currentTime < f.endTime
    );
    if (!cue) {
      this.clearPreview();
      return;
    }

    // 2. Make sure the sprite image is loaded
    try {
      const img = await this.ensureSpriteImage(cue.baseImgUrl);
      // 3. Draw the requested rectangle onto the off‑screen canvas
      this.offscreenCanvas.width = cropedWidth;
      this.offscreenCanvas.height = cropedHeight;
      const ctx = this.offscreenCanvas.getContext('2d');
      if (!ctx)
        throw new Error('Failed to get 2D context from off‑screen canvas');

      ctx.clearRect(0, 0, cropedWidth, cropedHeight);
      ctx.drawImage(
        img,
        cue.xPos,
        cue.yPos,
        cropedWidth,
        cropedHeight, // source
        0,
        0,
        cropedWidth,
        cropedHeight // dest
      );

      // 4. Grab the PNG data‑URL and expose it to the template
      this.previewSrc = this.offscreenCanvas.toDataURL('image/png');

      // 5. Set preview size (you may later multiply these by a scale factor)
      this.scaledW = cropedWidth;
      this.scaledH = cropedHeight;
      this.previewVisible = true;
    } catch (e) {
      console.error('Failed to produce preview', e);
      this.clearPreview();
    }
  }

  /** ---- Helper that keeps spriteImg cached ----------------- */
  private ensureSpriteImage(url: string): Promise<HTMLImageElement> {
    // If we already have a *complete* image with the same URL → reuse it
    if (
      this.spriteImg &&
      this.spriteImg.src === url &&
      this.spriteImg.complete
    ) {
      return Promise.resolve(this.spriteImg);
    }

    // Otherwise create a brand‑new image and wait for it to load
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.spriteImg = img; // cache for future calls
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  /** ---- Reset preview ------------------------------------ */
  private clearPreview(): void {
    this.previewSrc = '';
    this.previewVisible = false;
    this.scaledW = 0;
    this.scaledH = 0;
  }
}
