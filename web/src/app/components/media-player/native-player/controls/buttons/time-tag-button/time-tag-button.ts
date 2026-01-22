// src/app/components/default-video-player/controls/full-screen-button/full-screen-button.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerSettingsService } from '../../../services/player-settings.service';

@Component({
  selector: 'app-time-tag-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-tag-button.html',
})
export class TimeTagButton implements OnInit, OnDestroy {
  private playerSettings = inject(PlayerSettingsService);

  timeTagEnabled: boolean = false;

  ngOnInit() {
    this.playerSettings.settings$.subscribe((s) => {
      this.timeTagEnabled = s.timeTagEnabled;
    });
  }

  ngOnDestroy() {}

  toggleTimeTagPanel() {
    this.playerSettings.updateSetting(
      'timeTagEnabled',
      !this.playerSettings.currentSettings.timeTagEnabled
    );
  }
}
