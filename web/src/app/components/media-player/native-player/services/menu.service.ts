import { Injectable, OnInit, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { LocalStorageService } from './local-stroage.service';

@Injectable({ providedIn: 'root' })
export class MenuService implements OnInit, OnDestroy {
  /** Injected settings service for persisting UI options */
  private playerSettings = inject(LocalStorageService);

  readonly debuggerMenuVisible$ = new BehaviorSubject<boolean>(false);
  readonly tagTimeMenuVisible$ = new BehaviorSubject<boolean>(false);

  /** Cleanup subject used for unsubscription */
  private readonly destroy$ = new Subject<void>();

  init(): void {
    this.debuggerMenuVisible$.next(
      this.playerSettings.currentSettings.enableDebugger,
    );

    this.tagTimeMenuVisible$.next(
      this.playerSettings.currentSettings.timeTagEnabled,
    );
  }

  setDebuggerMenuVisible(v: boolean): void {
    this.debuggerMenuVisible$.next(v);
    this.playerSettings.updateSetting('enableDebugger', v);
  }

  setTagTimeMenuVisible(v: boolean): void {
    this.tagTimeMenuVisible$.next(v);
    this.playerSettings.updateSetting('timeTagEnabled', v);
  }

  ngOnInit(): void {}

  /** Clean up subscriptions when the service is destroyed */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.debuggerMenuVisible$.complete();
  }
}
