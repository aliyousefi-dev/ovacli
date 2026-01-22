import { Injectable, OnInit, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerSettingsService } from './player-settings.service';

@Injectable({ providedIn: 'root' })
export class PlayerUIService implements OnInit, OnDestroy {
  private playerSettings = inject(PlayerSettingsService);

  readonly debuggerMenuVisible$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    this.debuggerMenuVisible$.next(
      this.playerSettings.currentSettings.enableDebugger
    );
  }

  /** Clean up if the player component is destroyed. */
  ngOnDestroy(): void {
    this.debuggerMenuVisible$.complete();
  }

  setDebuggerMenuVisible(v: boolean): void {
    this.debuggerMenuVisible$.next(v);
    this.playerSettings.updateSetting('enableDebugger', v);
  }
}
