// src/app/components/media-player/native-player/controls/display-current-time/display-current-time.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatTime } from '../../utils/time-utils';
import { PlayerStateService } from '../../services/player-state.service';

@Component({
  selector: 'app-display-current-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-current-time.html',
})
export class DisplayCurrentTime implements OnInit, OnDestroy {
  playerState = inject(PlayerStateService);

  public currentTime: string = '00';
  private video!: HTMLVideoElement;
  formatTime = formatTime;

  ngOnInit() {
    this.playerState.currentTime$.subscribe((t) => {
      this.currentTime = formatTime(t);
    });
  }

  ngOnDestroy() {}
}
