// src/app/components/default-video-player/controls/full-screen-button/full-screen-button.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerUIService } from '../../../services/player-ui.service';

@Component({
  selector: 'app-time-tag-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-tag-button.html',
})
export class TimeTagButton implements OnInit, OnDestroy {
  private playerUI = inject(PlayerUIService);

  timeTagEnabled: boolean = false;

  ngOnInit() {
    this.playerUI.tagTimeMenuVisible$.subscribe((visbile) => {
      this.timeTagEnabled = visbile;
    });
  }

  ngOnDestroy() {}

  toggleTimeTagPanel() {
    this.playerUI.setTagTimeMenuVisible(
      !this.playerUI.tagTimeMenuVisible$.value,
    );
  }
}
