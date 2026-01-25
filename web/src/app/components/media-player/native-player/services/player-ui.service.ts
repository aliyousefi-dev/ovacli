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
import { PlayerSettingsService } from './player-settings.service';

@Injectable({ providedIn: 'root' })
export class PlayerUIService implements OnInit, OnDestroy {
  /** Injected settings service for persisting UI options */
  private playerSettings = inject(PlayerSettingsService);

  readonly debuggerMenuVisible$ = new BehaviorSubject<boolean>(false);
  readonly tagTimeMenuVisible$ = new BehaviorSubject<boolean>(false);
  readonly fullscreenEnabled$ = new BehaviorSubject<boolean>(false);
  readonly uiControlsVisible$ = new BehaviorSubject<boolean>(false);

  /** Reference to the video container element */
  private playerContainer: HTMLElement | null = null;

  /** Cleanup subject used for unsubscription */
  private readonly destroy$ = new Subject<void>();

  preload() {
    this.debuggerMenuVisible$.next(
      this.playerSettings.currentSettings.enableDebugger,
    );

    this.tagTimeMenuVisible$.next(
      this.playerSettings.currentSettings.timeTagEnabled,
    );
  }

  init(videoRef: ElementRef<HTMLElement>): void {
    const containerEl = videoRef?.nativeElement;

    if (!containerEl) {
      console.warn('[PlayerUIService] init() called with missing ElementRef');
      return;
    }

    this.playerContainer = containerEl;

    this.preload();

    // Subscribe to the native fullscreenchange event
    // and forward it to the fullscreenEnabled$ subject.
    fromEvent(document, 'fullscreenchange')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fullscreenEnabled$.next(!!document.fullscreenElement);
      });
  }

  async toggleFullscreen(): Promise<void> {
    if (!this.playerContainer) {
      console.warn('[PlayerUIService] toggleFullscreen() called before init()');
      return;
    }

    const isFullscreen = this.fullscreenEnabled$.value;

    if (isFullscreen) {
      // Exit full‑screen
      if (document.exitFullscreen) {
        try {
          // Unlock orientation before exiting
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
          await document.exitFullscreen();
        } catch (err) {
          console.error('Error exiting full‑screen mode:', err);
        }
      }
    } else {
      // Enter full‑screen
      if (this.playerContainer.requestFullscreen) {
        try {
          await this.playerContainer.requestFullscreen();

          // Try to lock the orientation to landscape on mobile devices
          if (screen.orientation && (screen.orientation as any).lock) {
            await (screen.orientation as any)
              .lock('landscape')
              .catch((err: any) => {
                console.log(
                  'Orientation lock failed or not supported on this device:',
                  err,
                );
              });
          }
        } catch (err) {
          console.error('Error enabling full‑screen mode:', err);
        }
      }
    }
  }

  setDebuggerMenuVisible(v: boolean): void {
    this.debuggerMenuVisible$.next(v);
    this.playerSettings.updateSetting('enableDebugger', v);
  }

  triggerUIControlsVisibility(): void {
    this.uiControlsVisible$.next(true);
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
    this.fullscreenEnabled$.complete();
  }
}
