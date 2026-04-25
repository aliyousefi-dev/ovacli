// src/app/components/default-video-player/controls/full-screen-button/full-screen-button.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'player-next-video-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './next-video-button.html',
})
export class NextVideoButton implements OnInit, OnDestroy {
  private playerUI = inject(MenuService);
  private playerStateService = inject(StateService)

  playlistMenuEnabled: boolean = false;

  ngOnInit() {
    this.playerUI.playlistMenuVisible$.subscribe((visbile) => {
      this.playlistMenuEnabled = visbile;
    });
  }

  ngOnDestroy() {}

  nextTrack() {
    this.playerUI.setPlaylistMenuVisibility(
      !this.playerUI.playlistMenuVisible$.value,
    );
  }
  previousTrack() {
    this.playerUI.setPlaylistMenuVisibility(
      !this.playerUI.playlistMenuVisible$.value,
    );
  }
}
