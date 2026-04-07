import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoData } from '../../../../../../ova-angular-sdk/core-types/video-data';
import { formatTime } from '../../utils/formatTime';
import { OVASDK } from '../../../../../../ova-angular-sdk/ova-sdk';
import { inject } from '@angular/core';
import { StateService } from '../../services/state.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'player-playlist-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-menu.html',
})
export class PlaylistMenu implements OnInit {
  @Input() activeVideo!: VideoData;
  @Input() playlistVideos: VideoData[] = [];

  private ovaSdk = inject(OVASDK);
  private playerState = inject(StateService);
  private MenuManagerService = inject(MenuService);

  formatTime = formatTime;

  formatNumbers(num: number): string {
    if (num < 10) {
      return '0' + num;
    }
    return num.toString();
  }

  ngOnInit() {
    this.MenuManagerService.playlistMenuVisible$.subscribe((v) => {
      if (true) {
        console.log('yesyes');
      }
    });
  }

  getThumbnail(videoId: string) {
    return this.ovaSdk.assets.thumbnail(videoId);
  }

  selectVideo(item: VideoData) {
    this.activeVideo = item;
    this.playerState.pause();
    this.playerState.setSource(item);
  }

  scrollToVideo(videoId: string) {
    const elementId = 'playlist-item-' + videoId;
    const activeElement = document.getElementById(elementId);
    if (activeElement)
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
  }

  closeMenu() {
    this.MenuManagerService.setPlaylistMenuVisibility(false);
  }
}
