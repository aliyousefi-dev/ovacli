import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStateService } from '../../../services/player-state.service';

@Component({
  selector: 'app-play-pause-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './play-pause-button.html',
})
export class PlayPauseButton implements OnInit {
  // Local state to track if the video is currently playing/paused
  public isPlaying: boolean = false;
  private playerState = inject(PlayerStateService);

  ngOnInit() {
    this.playerState.isPlaying$.subscribe((p) => {
      this.isPlaying = p;
    });
  }

  ngOnDestroy() {}

  togglePlay() {
    if (this.playerState.isPlaying$.value) {
      this.playerState.pause();
    } else {
      this.playerState.play();
    }
  }
}
