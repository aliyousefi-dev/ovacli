// src/app/services/player-ui.service.ts
import {
  Injectable,
  OnInit,
  OnDestroy,
  inject,
  ElementRef,
} from '@angular/core';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlayerStateService } from './player-state.service';
import { ScrubThumbApiService } from '../../../../../ova-angular-sdk/rest-api/scrub-thumb-api.service';
import { ScrubThumbStream } from '../data-types/scrub-thumb-data';
import { TimeTagService } from './time-tag.service';

@Injectable({ providedIn: 'root' })
export class ScrubPlayerService implements OnInit, OnDestroy {
  readonly seekTime$ = new BehaviorSubject<number>(0);
  readonly nearTimeTagLableBasedSeekTime$ = new BehaviorSubject<string>('');
  readonly nearTimeTagLableBasedCurrentTime$ = new BehaviorSubject<string>('');
  readonly seekTimePct$ = new BehaviorSubject<number>(0);
  readonly scrubVisibile$ = new BehaviorSubject<boolean>(false);
  readonly scrubThumbStream$ = new BehaviorSubject<ScrubThumbStream | null>(
    null,
  );

  private playerState = inject(PlayerStateService);
  private scrubThumbApiService = inject(ScrubThumbApiService);
  private timeTag = inject(TimeTagService);

  /** Cleanup subject used for unsubscription */
  private readonly destroy$ = new Subject<void>();

  init(videoId: string): void {
    this.scrubThumbApiService
      .loadScrubThumbnails(videoId)
      .subscribe((thumbnails) => {
        this.scrubThumbStream$.next(thumbnails);
      });

    this.playerState.currentTime$.subscribe((t) => {
      const label = this.findNearestTimeTagLabel(t);
      this.nearTimeTagLableBasedCurrentTime$.next(label);
    });
  }

  setScrubVisibility(b: boolean): void {
    this.scrubVisibile$.next(b);
  }

  setSeekTimePct(pct: number): void {
    this.seekTimePct$.next(pct);
    const duration = this.playerState.duration$.value;
    const time = (pct * duration) / 100;
    const clampedTime = Math.max(0, Math.min(time, duration));
    this.seekTime$.next(Number(clampedTime.toFixed(2)));

    const label = this.findNearestTimeTagLabel(this.seekTime$.value);
    this.nearTimeTagLableBasedSeekTime$.next(label);
  }

  findNearestTimeTagLabel(timeSec: number, thresholdSec = 5): string {
    const timeTags = this.timeTag.timeTags$.value;
    if (!timeTags?.length) return '';

    // 1. Keep only tags that are *close enough*.
    const nearbyTags = timeTags.filter(
      (tag) => Math.abs(timeSec - tag.timeSecond) <= thresholdSec,
    );

    // 2. If nothing is within the threshold, give up.
    if (!nearbyTags.length) return '';

    // 3. Find the one with the smallest difference.
    return nearbyTags.reduce(
      (nearest, tag) => {
        const diff = Math.abs(timeSec - tag.timeSecond);
        return diff < nearest.minDiff
          ? { label: tag.label, minDiff: diff }
          : nearest;
      },
      { label: '', minDiff: Infinity },
    ).label;
  }

  ngOnInit(): void {}

  /** Clean up subscriptions when the service is destroyed */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
