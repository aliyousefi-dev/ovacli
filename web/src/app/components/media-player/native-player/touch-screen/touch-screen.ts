import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayPauseIcon } from './Icons/play-pause-icon/play-pause-icon';
import { StepBackwardIcon } from './Icons/step-backward-icon/step-backward-icon';
import { StepForwardIcon } from './Icons/step-forward-icon/step-forward-icon';
import { PlayerStateService } from '../services/player-state.service';
import { PlayerUIService } from '../services/player-ui.service';

@Component({
  selector: 'app-touch-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PlayPauseIcon,
    StepBackwardIcon,
    StepForwardIcon,
  ],
  // Assuming the template is full-screen-button.component.html or full-screen-button.html
  templateUrl: './touch-screen.html',
})
export class TouchScreen implements AfterViewInit, OnInit, OnDestroy {
  playerState = inject(PlayerStateService);
  playerUI = inject(PlayerUIService);

  private lastTap = 0;
  private readonly DOUBLE_TAP_DELAY = 300;
  private readonly ICON_FLASH_MS = 800;
  private doubleTimeout: any;
  private stepForwardTimeout: any;
  private stepBackwardTimeout: any;
  stepForwardIconVisibility: boolean = false;
  stepBackwardIconVisibility: boolean = false;
  playPauseIconVisibility: boolean = false;

  ngOnInit(): void {
    this.playerUI.uiControlsVisibility$.subscribe((visible) => {
      this.playPauseIconVisibility = visible;
    });
  }

  ngAfterViewInit() {
    console.log('debugger view init');
  }

  togglePlayPause() {
    this.playerState.togglePlay();
  }

  stepForward() {
    this.playerState.stepForward();
    this.stepForwardIconVisibility = true;
    clearTimeout(this.stepForwardTimeout);
    this.stepForwardTimeout = setTimeout(() => {
      this.stepForwardIconVisibility = false;
    }, this.ICON_FLASH_MS);
  }

  stepBackward() {
    this.playerState.stepBackward();
    this.stepBackwardIconVisibility = true;
    clearTimeout(this.stepBackwardTimeout);
    this.stepBackwardTimeout = setTimeout(() => {
      this.stepBackwardIconVisibility = false;
    }, this.ICON_FLASH_MS);
  }

  doubleTouch(event: TouchEvent) {
    event.stopPropagation();
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTap;

    if (timeSinceLastTap < this.DOUBLE_TAP_DELAY) {
      clearTimeout(this.doubleTimeout);
      this.lastTap = 0;

      const touchX = event.touches[0].clientX;
      const screenWidth = window.innerWidth;

      if (touchX < screenWidth / 2) this.stepBackward();
      else this.stepForward();
    } else {
      this.lastTap = now;
      this.doubleTimeout = setTimeout(() => {}, this.DOUBLE_TAP_DELAY);
    }
  }

  ngOnDestroy() {}
}
