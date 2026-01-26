import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrubPlayerService } from '../../../services/scrub-player.service';
import { PlayerStateService } from '../../../services/player-state.service';
import { ScrubPreview } from '../scrub-preview/scrub-preview';
import { clamp } from '../../../utils/clamp';

@Component({
  selector: 'app-progress-track',
  standalone: true,
  templateUrl: './progress-track.component.html',
  imports: [CommonModule, ScrubPreview],
})
export class ProgressTrack implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('progress') progressRef!: ElementRef<HTMLDivElement>;
  @ViewChild('playHeadCircle') playHeadCircleRef!: ElementRef<HTMLDivElement>;
  @ViewChild('trackContainer') trackContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('scrubPreview') scrubPreviewRef!: ElementRef<HTMLDivElement>;

  private isDragging: boolean = false;
  private dragStartedOnTrack: boolean = false;

  private scrubTimeline = inject(ScrubPlayerService);
  private playerState = inject(PlayerStateService);

  scrubprevewVisibility: boolean = false;

  ngOnInit() {
    this.playerState.currentTimepct$.subscribe((pct) => {
      if (this.isDragging) return;
      this.setCirclePlayheadPositionPct(pct);
    });

    this.scrubTimeline.seekTimePct$.subscribe((pct) => {
      this.setScrubPreviewPositionPct(pct);
      if (!this.isDragging) return;
      this.setCirclePlayheadPositionPct(pct);
    });
  }

  ngAfterViewInit() {
    window.addEventListener('mousemove', this.setSeekPositionPct.bind(this));
    window.addEventListener('touchmove', this.setSeekPositionPct.bind(this));
    window.addEventListener('mouseup', this.onRelease.bind(this));
    window.addEventListener('touchend', (event) => {
      this.scrubprevewVisibility = false;
      this.onRelease();
    });
    this.trackContainerRef.nativeElement.addEventListener(
      'mousedown',
      this.onDrag.bind(this),
    );

    this.trackContainerRef.nativeElement.addEventListener(
      'touchstart',
      (event) => {
        this.scrubprevewVisibility = true;
        this.onDrag(event);
      },
    );

    this.trackContainerRef.nativeElement.addEventListener(
      'mouseenter',
      (event) => {
        this.setSeekPositionPct(event);
        this.scrubprevewVisibility = true;
      },
    );
    this.trackContainerRef.nativeElement.addEventListener('mouseleave', () => {
      this.scrubprevewVisibility = false;
    });
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

  setScrubPreviewPositionPct(pct: number) {
    if (!this.scrubPreviewRef || !this.trackContainerRef) return;

    if (!this.scrubprevewVisibility) return;

    const previewWidth =
      this.scrubPreviewRef.nativeElement.getBoundingClientRect().width;

    const trackWidth =
      this.trackContainerRef.nativeElement.getBoundingClientRect().width;
    const halfPreviewWidth = previewWidth / 2;
    const halfpct = Math.round((halfPreviewWidth / trackWidth) * 100);
    const startClamp = halfpct;
    const endClamp = 100 - halfpct;

    const clampedPct = clamp(pct, startClamp, endClamp);

    this.scrubPreviewRef.nativeElement.style.left = `${clampedPct}%`;
  }

  setCirclePlayheadPositionPct(pct: number) {
    if (this.progressRef && this.playHeadCircleRef) {
      this.progressRef.nativeElement.style.width = pct + '%';
      this.playHeadCircleRef.nativeElement.style.left = pct + '%';
    }
  }

  onDrag(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.dragStartedOnTrack = true;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      this.setSeekPositionPct(event);
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
