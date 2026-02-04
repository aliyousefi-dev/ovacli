import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';
import { NativePlayer } from '../native-player/native-player';
import { VidstackPlayerComponent } from '../vidstack-player/vidstack-player.component';

import { AppSettingsService } from '../../../../app-settings/app-settings.service';

@Component({
  selector: 'app-player-manager',
  standalone: true,
  templateUrl: './player-manager.html',
  imports: [CommonModule, NativePlayer, VidstackPlayerComponent],
})
export class PlayerManager implements OnInit {
  @Input() videoData!: VideoData;

  useNativePlayer: boolean = false;

  private appSetting = inject(AppSettingsService);

  ngOnInit(): void {
    this.appSetting.settings$.subscribe((s) => {
      this.useNativePlayer = s.useNativePlayer;
    });
  }
}
