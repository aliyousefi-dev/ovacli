import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatTime } from '../../utils/time-utils';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-display-current-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-current-time.html',
})
export class DisplayCurrentTime implements OnInit, OnDestroy {
  private playerState = inject(StateService);

  currentTime: string = '00';
  formatTime = formatTime;

  ngOnInit() {
    this.playerState.currentTime$.subscribe((t) => {
      this.currentTime = formatTime(t);
    });
  }

  ngOnDestroy() {}
}
