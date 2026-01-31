// src/app/components/media-player/native-player/controls/display-total-time/display-total-time.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatTime } from '../../utils/formatTime';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-display-total-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-total-time.html',
})
export class DisplayTotalTime implements OnInit, OnDestroy {
  private playerState = inject(StateService);

  videoDuration: string = '00';
  formatTime = formatTime;

  ngOnInit() {
    this.playerState.duration$.subscribe((d) => {
      this.videoDuration = formatTime(d);
    });
  }

  ngOnDestroy() {}
}
