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

@Injectable({ providedIn: 'root' })
export class ScrubTimelineService implements OnInit, OnDestroy {
  readonly scrubTime$ = new BehaviorSubject<number>(0);
  readonly seekTime$ = new BehaviorSubject<number>(0);
  readonly seekTimePct$ = new BehaviorSubject<number>(0);
  readonly scrubVisibile$ = new BehaviorSubject<boolean>(false);

  private playerState = inject(PlayerStateService);

  /** Cleanup subject used for unsubscription */
  private readonly destroy$ = new Subject<void>();

  setScrubTime(time: number): void {
    this.scrubTime$.next(time);
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
  }

  ngOnInit(): void {}

  /** Clean up subscriptions when the service is destroyed */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.scrubTime$.complete();
  }
}
