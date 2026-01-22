// scrub-image.component.ts
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ScrubThumbStream } from '../data-types/scrub-thumb-data'; // <-- new type
import { PlayerStateService } from '../services/player-state.service';

@Component({
  selector: 'app-scrub-image',
  templateUrl: './scrub-image.html',
  imports: [CommonModule],
})
export class ScrubImageComponent implements OnInit, OnDestroy {
  /** The full stream – it contains the crop size + the list of stats. */
  @Input({ required: true }) scrubThumbStream!: ScrubThumbStream;

  private readonly playerState = inject(PlayerStateService);

  private currentTime = 0;
  private timeSub?: Subscription;

  // styles that are applied to the preview div
  previewImageStyles: Record<string, string> = {
    opacity: '0',
    width: '0px',
    height: '0px',
    backgroundImage: 'none',
    backgroundPosition: '0 0',
    backgroundSize: 'auto',
  };

  /* ----------------------------------------------------------- */
  /*  Life‑cycle hooks */
  /* ----------------------------------------------------------- */

  ngOnInit(): void {
    this.timeSub = this.playerState.currentTime$.subscribe((time) => {
      this.currentTime = time;
      this.updatePreview(); // react to every tick
    });
  }

  ngOnDestroy(): void {
    this.timeSub?.unsubscribe();
  }

  /* ----------------------------------------------------------- */
  /*  Core preview logic */
  /* ----------------------------------------------------------- */

  private updatePreview(): void {
    if (!this.scrubThumbStream?.thumbStats?.length) {
      this.clearPreview();
      return;
    }

    const { cropedWidth, cropedHeight, thumbStats } = this.scrubThumbStream;

    // Find the thumbnail whose interval contains the current time
    const cue = thumbStats.find(
      (f) => this.currentTime >= f.startTime && this.currentTime < f.endTime
    );

    if (!cue) {
      // Time is outside the known intervals – hide the preview
      this.clearPreview();
      return;
    }

    // All thumbnails that come from the same sprite image (same URL, same Y‑offset)
    const sameSpriteFrames = thumbStats.filter(
      (f) => f.baseImgUrl === cue.baseImgUrl && f.yPos === cue.yPos
    );

    // Full width of the sprite that contains all frames.
    // It is simply the maximum (xPos + cropedWidth) of the frames we share.
    const spriteFullWidth = Math.max(
      ...sameSpriteFrames.map((f) => f.xPos + cropedWidth)
    );

    // Dimensions of the individual preview – they come from the stream
    const scaledW = cropedWidth;
    const scaledH = cropedHeight;

    this.previewImageStyles = {
      opacity: '1',
      width: `${Math.round(scaledW)}px`,
      height: `${Math.round(scaledH)}px`,
      backgroundImage: `url(${cue.baseImgUrl})`,
      backgroundPosition: `-${Math.round(cue.xPos)}px -${Math.round(
        cue.yPos
      )}px`,
      backgroundSize: `${Math.round(spriteFullWidth)}px auto`,
      backgroundRepeat: 'no-repeat',
    };
  }

  private clearPreview(): void {
    this.previewImageStyles = {
      opacity: '0',
      width: '0px',
      height: '0px',
      backgroundImage: 'none',
      backgroundPosition: '0 0',
      backgroundSize: 'auto',
    };
  }
}
