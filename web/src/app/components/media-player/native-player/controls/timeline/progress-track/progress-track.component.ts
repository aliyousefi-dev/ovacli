import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrubTimelineService } from '../../../services/scrub-timeline.service';
import { PlayerStateService } from '../../../services/player-state.service';

@Component({
  selector: 'app-progress-track',
  standalone: true,
  templateUrl: './progress-track.component.html',
  imports: [CommonModule],
})
export class ProgressTrack implements OnInit, OnDestroy {
  @ViewChild('progress') progressRef!: ElementRef<HTMLDivElement>;
  @ViewChild('playHeadCircle') playHeadCircleRef!: ElementRef<HTMLDivElement>;
  @ViewChild('trackContainer') trackContainerRef!: ElementRef<HTMLDivElement>;

  debug = 'none';

  private isDragging: boolean = false;
  private dragStartedOnTrack: boolean = false;

  private scrubTimeline = inject(ScrubTimelineService);
  private playerState = inject(PlayerStateService);

  ngOnInit() {
    this.playerState.currentTimepct$.subscribe((pct) => {
      if (this.isDragging) return;

      this.setCirclePlayheadPositionPct(pct);
    });

    this.scrubTimeline.seekTimePct$.subscribe((pct) => {
      if (!this.isDragging) return;
      this.setCirclePlayheadPositionPct(pct);
    });

    window.addEventListener('mousemove', this.setSeekPositionPct.bind(this));
    window.addEventListener('mouseup', this.onRelease.bind(this));
  }

  ngOnDestroy() {}

  // Converts mouse or touch coordinates into a 0-100% seek value for the timeline.
  setSeekPositionPct(event: MouseEvent | TouchEvent) {
    const x =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;

    const rect = this.trackContainerRef.nativeElement.getBoundingClientRect();

    const relX = x - rect.left;
    const width = rect.width;

    // 2. Use + or Number() to convert the string back to a number
    const pct = Number(((relX / width) * 100).toFixed(2));

    const safePct = Math.max(0, Math.min(100, pct));

    this.scrubTimeline.setSeekTimePct(safePct);
  }

  setCirclePlayheadPositionPct(pct: number) {
    if (this.progressRef && this.playHeadCircleRef) {
      this.progressRef.nativeElement.style.width = pct + '%';
      this.playHeadCircleRef.nativeElement.style.left = pct + '%';
    }
  }

  onDrag(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartedOnTrack = true;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      this.setSeekPositionPct(event);
      console.log('ok');
    }
  }

  onRelease() {
    if (this.dragStartedOnTrack) {
      this.playerState.seekToTime(this.scrubTimeline.seekTime$.value);
    }
    this.isDragging = false;
    this.dragStartedOnTrack = false;
  }
}
