// src/app/services/player-ui.service.ts
import { Injectable, OnInit, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { GlobalPlayerConfig } from '../config';

@Injectable()
export class InteractionService implements OnInit, OnDestroy {
  private playerControlsVisibilityTimeout: any;
  private stepForwardIconVisibilityTimeout: any;
  private stepBackwardIconVisibilityTimeout: any;

  readonly uiControlsVisibility$ = new BehaviorSubject<boolean>(false);
  readonly stepForwardIconVisibility$ = new BehaviorSubject<boolean>(false);
  readonly stepBackwardIconVisibility$ = new BehaviorSubject<boolean>(false);

  /** Cleanup subject used for unsubscription */
  private readonly destroy$ = new Subject<void>();

  private configs = inject(GlobalPlayerConfig);

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
    }, this.configs.ICON_FLASH_MS);
  }

  triggerStepBackwardIconVisibility(): void {
    this.stepBackwardIconVisibility$.next(true);
    clearTimeout(this.stepBackwardIconVisibilityTimeout);
    this.stepBackwardIconVisibilityTimeout = setTimeout(() => {
      this.stepBackwardIconVisibility$.next(false);
    }, this.configs.ICON_FLASH_MS);
  }

  ngOnInit(): void {}

  /** Clean up subscriptions when the service is destroyed */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
