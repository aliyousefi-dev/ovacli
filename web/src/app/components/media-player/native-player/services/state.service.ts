import { Injectable, ElementRef, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Resolution } from '../data-types/resolution';
import { LocalStorageService } from './local-stroage.service';
import { InteractionService } from './interaction.service';
import { GlobalPlayerConfig } from '../config';
import { TimeTagService } from './time-tag.service';

@Injectable()
export class StateService implements OnDestroy {
  readonly currentTime$ = new BehaviorSubject<number>(0);
  readonly currentTimepct$ = new BehaviorSubject<number>(0);
  readonly remainingTime$ = new BehaviorSubject<number>(0);
  readonly bufferedSec$ = new BehaviorSubject<number>(0);
  readonly bufferedRanges$ = new BehaviorSubject<TimeRanges | null>(null);
  readonly currentSpeed$ = new BehaviorSubject<number>(1);
  readonly duration$ = new BehaviorSubject<number>(0);
  readonly volume$ = new BehaviorSubject<number>(1);
  readonly muted$ = new BehaviorSubject<boolean>(false);
  readonly isPlaying$ = new BehaviorSubject<boolean>(false);
  readonly src$ = new BehaviorSubject<string | null>(null);
  readonly resolution$ = new BehaviorSubject<Resolution>({
    width: 0,
    height: 0,
  });

  private playerSettings = inject(LocalStorageService);
  private interactionService = inject(InteractionService);
  private configs = inject(GlobalPlayerConfig);
  private timeTagService = inject(TimeTagService);

  private readonly destroy$ = new Subject<void>();

  private videoEl: HTMLVideoElement | null = null;

  loadLocalStorage() {
    if (!this.videoEl) return;

    // set default settings
    this.videoEl.muted = this.playerSettings.currentSettings.isMuted;
    this.videoEl.volume = Math.max(
      0,
      Math.min(this.playerSettings.currentSettings.soundLevel, 1),
    );
    this.videoEl.playbackRate =
      this.playerSettings.currentSettings.playbackSpeed;
  }

  init(videoRef: ElementRef<HTMLVideoElement>): void {
    const videoEl = videoRef?.nativeElement;

    if (!videoEl) {
      console.warn(
        '[PlayerStateService] init() called with missing ElementRef',
      );
      return;
    }

    this.videoEl = videoEl; // keep a reference for the helper methods

    this.loadLocalStorage();

    /* ---------- Raw event streams ---------- */
    const timeUpdate$ = fromEvent(videoEl, 'timeupdate');
    const speedRate$ = fromEvent(videoEl, 'ratechange');
    const metadata$ = fromEvent(videoEl, 'loadedmetadata');
    const volume$ = fromEvent(videoEl, 'volumechange');
    const play$ = fromEvent(videoEl, 'play');
    const pause$ = fromEvent(videoEl, 'pause');
    const ended$ = fromEvent(videoEl, 'ended');
    const progress$ = fromEvent(videoEl, 'progress');

    /* ---------- Push values into the BSS ---------- */
    timeUpdate$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentTime$.next(videoEl.currentTime);
      this.remainingTime$.next(videoEl.duration - videoEl.currentTime);
      let percent = (videoEl.currentTime / videoEl.duration) * 100;
      this.currentTimepct$.next(percent);
    });

    speedRate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.currentSpeed$.next(videoEl.playbackRate));

    metadata$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.duration$.next(videoEl.duration);
      this.resolution$.next({
        width: videoEl.videoWidth,
        height: videoEl.videoHeight,
      });
    });

    volume$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.muted$.next(videoEl.muted);
      this.volume$.next(videoEl.volume);
    });

    progress$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.bufferedRanges$.next(videoEl.buffered);
      let bf = videoEl.buffered;
      let length = 0;
      for (let i = 0; i < bf.length; i++) {
        const start = bf.start(i);
        const end = bf.end(i);
        let minus = end - start;
        length += minus;
      }
      this.bufferedSec$.next(length);
    });

    play$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.isPlaying$.next(true));
    pause$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.isPlaying$.next(false));
    ended$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.isPlaying$.next(false));
  }

  /** Plays the video (if it’s already bound). */
  play(): void {
    if (!this.videoEl) return;
    this.videoEl.play();
  }

  togglePlay() {
    if (!this.videoEl) return;

    if (this.videoEl.paused) {
      this.videoEl.play();
    } else {
      this.videoEl.pause();
    }
  }

  /** Pauses the video. */
  pause(): void {
    if (!this.videoEl) return;
    this.videoEl.pause();
  }

  /** Seeks to a specific time (in seconds). */
  seekToTime(seconds: number): void {
    if (!this.videoEl) return;
    const clamped = Math.max(0, Math.min(seconds, this.videoEl.duration));
    this.videoEl.currentTime = clamped;
  }

  stepForward() {
    if (!this.videoEl) return;
    this.seekToTime(this.videoEl.currentTime + this.configs.SEEK_STEP);
    this.interactionService.triggerStepForwardIconVisibility();
  }

  stepBackward() {
    if (!this.videoEl) return;
    this.seekToTime(this.videoEl.currentTime - this.configs.SEEK_STEP);
    this.interactionService.triggerStepBackwardIconVisibility();
  }

  shiftStepForward() {
    if (!this.videoEl) return;
    this.seekToTime(this.videoEl.currentTime + this.configs.SHIFT_SEEK_STEP);
    this.interactionService.triggerStepForwardIconVisibility();
  }

  shiftStepBackward() {
    if (!this.videoEl) return;
    this.seekToTime(this.videoEl.currentTime - this.configs.SHIFT_SEEK_STEP);
    this.interactionService.triggerStepBackwardIconVisibility();
  }

  stepForwardTimeTag() {
    if (!this.videoEl) return;

    const currentTime = this.videoEl.currentTime;
    const timeTags = this.timeTagService.timeTags$.value;

    const nextTag = timeTags.find((tag) => tag.timeSecond > currentTime + 0.5);

    if (nextTag) {
      this.seekToTime(nextTag.timeSecond);
      this.interactionService.triggerStepForwardIconVisibility();
    }
  }

  stepBackwardTimeTag() {
    if (!this.videoEl) return;

    const currentTime = this.videoEl.currentTime;
    const timeTags = this.timeTagService.timeTags$.value;

    const previousTag = [...timeTags]
      .reverse()
      .find((tag) => tag.timeSecond < currentTime - 0.5);

    if (previousTag) {
      this.seekToTime(previousTag.timeSecond);
      this.interactionService.triggerStepBackwardIconVisibility();
    }
  }

  /** Sets the volume (0 – 1). */
  setVolume(v: number): void {
    if (!this.videoEl) return;
    const clamped = Math.max(0, Math.min(v, 1));
    this.videoEl.volume = clamped;
    this.playerSettings.updateSetting('soundLevel', v);
  }

  /** Mutes / unmutes the video. */
  setMuted(muted: boolean): void {
    if (!this.videoEl) return;
    this.videoEl.muted = muted;
    this.muted$.next(muted);
    this.playerSettings.updateSetting('isMuted', muted);
  }

  toggleMute(): void {
    if (!this.videoEl) return;
    this.setMuted(!this.videoEl.muted);
  }

  setPlayRate(speedValue: number): void {
    if (!this.videoEl) return;
    this.videoEl.playbackRate = speedValue;
    this.playerSettings.updateSetting('playbackSpeed', speedValue);
  }

  /** Loads a new source.  (Useful if you want to change the stream.) */
  setSource(src: string): void {
    if (!this.videoEl) return;
    this.videoEl.src = src;
    this.videoEl.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.currentTime$.complete();
    this.duration$.complete();
    this.volume$.complete();
    this.muted$.complete();
    this.isPlaying$.complete();
    this.src$.complete();
  }
}
