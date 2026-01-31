// src/app/components/default-video-player/video-timeline/video-tracks/buffered-track/buffered-track.component.ts

import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BufferedRangeData } from '../../../data-types/buffered-range-data';
import { mergeBufferedRanges } from '../../../utils/mergeBufferedRanges';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-buffered-track',
  standalone: true,
  templateUrl: './buffered-track.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BufferedTrack implements OnInit, OnDestroy {
  /**
   * Local ViewChild for the buffered div element.
   * This is where the dynamic buffered range segments will be rendered.
   */
  @ViewChild('buffered') bufferedRef!: ElementRef<HTMLDivElement>;

  private playerState = inject(StateService);

  ngOnInit() {
    this.playerState.bufferedRanges$.subscribe(() => {
      this.updateBuffered();
    });
  }

  ngOnDestroy() {}

  /**
   * Updates the buffered range display by creating and inserting dynamic DIV segments.
   * (Refactored from your parent component)
   */
  private updateBuffered = () => {
    if (!this.bufferedRef) {
      return;
    }

    const buffered = this.playerState.bufferedRanges$.value;
    const duration = this.playerState.duration$.value;

    if (!buffered) return;

    if (buffered.length > 0) {
      let ranges: BufferedRangeData[] = [];

      for (let i = 0; i < buffered.length; i++) {
        const start = buffered.start(i);
        const end = buffered.end(i);
        ranges.push({ start, end });
      }

      ranges = mergeBufferedRanges(ranges);
      let bufferedHTML = '';

      for (let range of ranges) {
        const pctStart = (range.start / duration) * 100;
        const pctEnd = (range.end / duration) * 100;
        const width = pctEnd - pctStart;

        // Create a segment for the merged buffered range
        bufferedHTML += `
          <div class="absolute top-0 h-full bg-white"
            style="left: ${pctStart}%; width: ${width}%;"></div>
        `;
      }

      // Update the buffered div with the new HTML content (merged ranges)
      this.bufferedRef.nativeElement.innerHTML = bufferedHTML;
    }
  };
}
