import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaveToModalComponent } from '../../../components/playlist/saveto-modal/saveto-modal';
import { RouterModule } from '@angular/router';

import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

import { ViewChild } from '@angular/core';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';

@Component({
  selector: 'app-video-action-bar',
  standalone: true,
  imports: [CommonModule, SaveToModalComponent, RouterModule], // Add PlaylistModalComponent to imports
  templateUrl: './video-action-bar.component.html',
  styles: [],
})
export class VideoActionBarComponent {
  @ViewChild(SaveToModalComponent) saveToModal!: SaveToModalComponent;

  @Input() videoData!: VideoData;
  @Input() getCurrentTimeFn?: () => number;

  @Input() isSaved = false;
  @Input() loadingSavedVideo = false;

  private ovaSdk = inject(OVASDK);

  trimMode = false;
  trimStart: number | null = null;
  trimEnd: number | null = null;

  playlistModalVisible = false; // New property to control modal visibility

  downloadVideo(): void {
    const url = this.ovaSdk.assets.download.full(this.videoData.videoId);
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.click();
  }

  formatTime(seconds: number | null | undefined): string {
    if (seconds == null || isNaN(seconds)) return '–';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  openSaveToModal(): void {
    this.saveToModal.open();
  }
}
