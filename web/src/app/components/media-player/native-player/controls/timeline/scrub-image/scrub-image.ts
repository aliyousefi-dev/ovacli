// ------------- app/scrub-image/scrub-image.component.ts -------------
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ScrubService } from '../../../services/scrub.service';
import { ScrubThumbStream } from '../../../data-types/scrub-thumb-data';

@Component({
  selector: 'app-scrub-image',
  templateUrl: './scrub-image.html',
  imports: [CommonModule],
})
export class ScrubImageComponent implements OnInit, OnDestroy {
  /** Stream that contains all the data we need for the preview. */
  scrubThumbStream: ScrubThumbStream | null = null;

  /** Display‑flag & inline styles for the preview container. */
  previewVisible = false;
  previewStyle: Record<string, string> = {};

  /** How much we want to zoom in (e.g. 2 = 200 %).  */
  private readonly SCALE_FACTOR = 1.8; // ← change this to whatever you need

  /* ---------- 3️⃣ Service injection ---------- */
  private readonly scrubTimeline = inject(ScrubService);

  /* ---------- 4️⃣ Private helpers ---------- */
  private currentTime = 0;
  private readonly subs = new Subscription();

  /* ---------- 5️⃣ Component life‑cycle ---------- */
  ngOnInit(): void {
    this.subs.add(
      this.scrubTimeline.seekTime$.subscribe((t) => {
        this.currentTime = t;
        this.updatePreview();
      }),
    );

    this.subs.add(
      this.scrubTimeline.scrubThumbStream$.subscribe((s) => {
        this.scrubThumbStream = s;
        this.updatePreview(); // first render
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /* ---------- 6️⃣ Build the preview style ---------- */
  private updatePreview(): void {
    const stream = this.scrubThumbStream;
    if (!stream?.thumbStats?.length) {
      this.clearPreview();
      return;
    }

    const { cropedWidth, cropedHeight, thumbStats, spriteWidth, spriteHeight } =
      stream;

    /* ---------- 6a. Find the cue that matches the current scrub position ---------- */
    const cue = thumbStats.find(
      (f) => this.currentTime >= f.startTime && this.currentTime < f.endTime,
    );
    if (!cue) {
      this.clearPreview();
      return;
    }

    /* ---------- 6b. Scale the *box* dimensions ---------- */
    const scaledW = cropedWidth * this.SCALE_FACTOR;
    const scaledH = cropedHeight * this.SCALE_FACTOR;

    const scaledSpriteW = spriteWidth * this.SCALE_FACTOR;
    const scaledSpriteH = spriteHeight * this.SCALE_FACTOR;

    const scaledPosX = cue.xPos * this.SCALE_FACTOR;
    const scaledPosY = cue.yPos * this.SCALE_FACTOR;

    /* ---------- 6d. Build the style object ---------- */
    this.previewStyle = {
      width: `${scaledW}px`,
      height: `${scaledH}px`,
      backgroundImage: `url(${cue.baseImgUrl})`,
      backgroundSize: `${scaledSpriteW}px ${scaledSpriteH}px`, // scale the whole sprite
      backgroundPosition: `-${scaledPosX}px -${scaledPosY}px`,
      backgroundRepeat: 'no-repeat',
    };

    this.previewVisible = true;
  }

  /* ---------- 7️⃣ Hide the preview ---------- */
  private clearPreview(): void {
    this.previewVisible = false;
    this.previewStyle = {};
  }
}
