// src/app/services/player-ui.service.ts
import { Injectable, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InteractionService implements OnInit, OnDestroy {
  private playerControlsVisibilityTimeout: any;
  private stepForwardIconVisibilityTimeout: any;
  private stepBackwardIconVisibilityTimeout: any;

  readonly uiControlsVisibility$ = new BehaviorSubject<boolean>(false);
  readonly stepForwardIconVisibility$ = new BehaviorSubject<boolean>(false);
  readonly stepBackwardIconVisibility$ = new BehaviorSubject<boolean>(false);

  /** Cleanup subject used for unsubscription */
  private readonly destroy$ = new Subject<void>();

  init(): void {}

  triggerUIControlsVisibility(): void {
    this.uiControlsVisibility$.next(true);
    clearTimeout(this.playerControlsVisibilityTimeout);
    this.playerControlsVisibilityTimeout = setTimeout(() => {
      this.uiControlsVisibility$.next(false);
    }, 3000);
  }

  triggerStepForwardIconVisibility(): void {
    this.stepForwardIconVisibility$.next(true);
    clearTimeout(this.stepForwardIconVisibilityTimeout);
    this.stepForwardIconVisibilityTimeout = setTimeout(() => {
      this.stepForwardIconVisibility$.next(false);
    }, 3000);
  }

  triggerStepBackwardIconVisibility(): void {
    this.stepBackwardIconVisibility$.next(true);
    clearTimeout(this.stepBackwardIconVisibilityTimeout);
    this.stepBackwardIconVisibilityTimeout = setTimeout(() => {
      this.stepBackwardIconVisibility$.next(true);
    }, 3000);
  }

  ngOnInit(): void {}

  /** Clean up subscriptions when the service is destroyed */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
