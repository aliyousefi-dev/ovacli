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

@Injectable({ providedIn: 'root' })
export class ScrubTimelineService implements OnInit, OnDestroy {
  readonly scrubTime$ = new BehaviorSubject<number>(0);
  readonly scrubVisibile$ = new BehaviorSubject<boolean>(false);

  /** Cleanup subject used for unsubscription */
  private readonly destroy$ = new Subject<void>();

  setScrubTime(time: number): void {
    this.scrubTime$.next(time);
  }

  setScrubVisibility(b: boolean): void {
    this.scrubVisibile$.next(b);
  }

  ngOnInit(): void {}

  /** Clean up subscriptions when the service is destroyed */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.scrubTime$.complete();
  }
}
