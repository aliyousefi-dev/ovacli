import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-mute-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volume-button.html',
})
export class VolumeButton implements OnInit, OnDestroy {
  playerState = inject(StateService);

  public isMuted: boolean = false;
  public volumeLevel: number = 1;
  public hoverPercent: number = 100;

  ngOnInit() {
    this.playerState.volume$.subscribe((v) => {
      this.volumeLevel = v;
    });

    this.playerState.muted$.subscribe((m) => {
      this.isMuted = m;
    });
  }

  ngOnDestroy() {}

  updateHoverPercent(event: MouseEvent) {
    const input = event.target as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percent = Math.min(Math.max(0, x / width), 1);
    this.hoverPercent = Math.round(percent * 100);
  }

  onVolumeChanged() {
    this.playerState.setVolume(this.hoverPercent / 100);
  }

  toggleMute() {
    this.playerState.setMuted(!this.playerState.muted$.value);
  }
}
