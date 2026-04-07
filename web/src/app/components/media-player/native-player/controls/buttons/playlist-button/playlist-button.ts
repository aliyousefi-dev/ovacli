// src/app/components/default-video-player/controls/full-screen-button/full-screen-button.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';

@Component({
  selector: 'player-playlist-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-button.html',
})
export class PlaylistButton implements OnInit, OnDestroy {
  private playerUI = inject(MenuService);

  playlistMenuEnabled: boolean = false;

  ngOnInit() {
    this.playerUI.playlistMenuVisible$.subscribe((visbile) => {
      this.playlistMenuEnabled = visbile;
    });
  }

  ngOnDestroy() {}

  togglePlaylistPanel() {
    this.playerUI.setPlaylistMenuVisibility(
      !this.playerUI.playlistMenuVisible$.value,
    );
  }
}
