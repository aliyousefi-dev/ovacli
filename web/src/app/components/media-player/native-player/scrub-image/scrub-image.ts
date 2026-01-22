// scrub-image.component.ts
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ScrubThumbData } from '../data-types/scrub-thumb-data'; // adjust path as needed
import { PlayerStateService } from '../services/player-state.service';

@Component({
  selector: 'app-scrub-image',
  templateUrl: './scrub-image.html',
  imports: [CommonModule],
})
export class ScrubImageComponent implements OnInit, OnDestroy {
  @Input({ required: true }) scrubThumbData!: ScrubThumbData[];

  private readonly playerState = inject(PlayerStateService);

  private currentTime = 0;

  private timeSub?: Subscription;

  previewImageStyles: Record<string, string> = {
    opacity: '0',
    width: '0px',
    height: '0px',
    backgroundImage: 'none',
    backgroundPosition: '0 0',
    backgroundSize: 'auto',
  };

  ngOnInit(): void {
    this.timeSub = this.playerState.currentTime$.subscribe((time) => {
      this.currentTime = time;
      this.updatePreview(); // react to every tick
    });
  }

  ngOnDestroy(): void {
    this.timeSub?.unsubscribe();
  }

  private updatePreview(): void {
    if (!this.scrubThumbData?.length) {
      this.clearPreview();
      return;
    }

    const cue = this.scrubThumbData.find(
      (f) => this.currentTime >= f.start && this.currentTime < f.end
    );

    if (!cue) {
      // Time is outside the known intervals – hide the preview
      this.clearPreview();
      return;
    }

    /* ------------------------------------------------------------------
     * 2️⃣ Compute the full width of the sprite (all frames that share
     *     the same image / same y‑offset)
     * ------------------------------------------------------------------ */
    const sameSpriteFrames = this.scrubThumbData.filter(
      (f) => f.url === cue.url && f.y === cue.y
    );
    const spriteFullWidth = Math.max(...sameSpriteFrames.map((f) => f.x + f.w)); // in original pixels

    const scaledW = cue.w;
    const scaledH = cue.h;

    this.previewImageStyles = {
      opacity: '1',
      width: `${Math.round(scaledW)}px`,
      height: `${Math.round(scaledH)}px`,
      backgroundImage: `url(${cue.url})`,
      // Show the exact part of the sprite that matches `cue.x`
      backgroundPosition: `-${Math.round(cue.x)}px -${Math.round(cue.y)}px`,
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
