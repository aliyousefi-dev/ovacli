// src/app/components/default-video-player/video-timeline/video-tracks/buffered-track/buffered-track.component.ts

import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BufferedRangeData } from '../../data-types/buffered-range-data';

@Component({
  selector: 'app-buffered-track',
  standalone: true,
  templateUrl: './buffered-track.component.html',
  imports: [CommonModule],
})
export class BufferedTrackComponent implements OnChanges {
  @Input({ required: true }) bufferedRanges: TimeRanges | null = null;
  @Input({ required: true }) duration: number = 0;

  @ViewChild('bufferedContainer')
  bufferedContainer!: ElementRef<HTMLDivElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['bufferedRanges'] || changes['duration']) &&
      this.bufferedRanges &&
      this.duration > 0
    ) {
      this.renderBufferedRanges();
    }
  }

  private renderBufferedRanges() {
    const buffered = this.bufferedRanges as TimeRanges;
    const container = this.bufferedContainer.nativeElement;

    if (buffered.length === 0) {
      container.innerHTML = '';
      return;
    }

    let ranges: BufferedRangeData[] = [];
    for (let i = 0; i < buffered.length; i++) {
      ranges.push({ start: buffered.start(i), end: buffered.end(i) });
    }

    ranges = this.mergeBufferedRanges(ranges);

    container.innerHTML = ranges
      .map((range) => {
        const pctStart = (range.start / this.duration) * 100;
        const pctEnd = (range.end / this.duration) * 100;
        const width = pctEnd - pctStart;

        return `
        <div class="absolute top-0 h-full bg-gray-400"
              style="left: ${pctStart}%; width: ${width}%;"></div>
      `;
      })
      .join('');
  }

  // Helper function to merge overlapping or adjacent buffered ranges (from original code)
  private mergeBufferedRanges(
    ranges: BufferedRangeData[]
  ): BufferedRangeData[] {
    ranges.sort((a, b) => a.start - b.start);
    let mergedRanges: BufferedRangeData[] = [];

    for (let range of ranges) {
      if (
        mergedRanges.length === 0 ||
        mergedRanges[mergedRanges.length - 1].end < range.start
      ) {
        mergedRanges.push(range);
      } else {
        mergedRanges[mergedRanges.length - 1].end = Math.max(
          mergedRanges[mergedRanges.length - 1].end,
          range.end
        );
      }
    }
    return mergedRanges;
  }
}
