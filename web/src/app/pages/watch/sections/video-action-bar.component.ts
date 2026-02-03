import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SendtoModalComponent } from '../../../components/pop-ups/sendto-modal/sendto-modal.component';
import { RouterModule } from '@angular/router';

import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

@Component({
  selector: 'app-video-action-bar',
  standalone: true,
  imports: [CommonModule, SendtoModalComponent, RouterModule], // Add PlaylistModalComponent to imports
  templateUrl: './video-action-bar.component.html',
  styles: [],
})
export class VideoActionBarComponent {
  @Input() videoId?: string | null;
  @Input() getCurrentTimeFn?: () => number;

  @Input() isSaved = false;
  @Input() loadingSavedVideo = false;

  private ovaSdk = inject(OVASDK);

  trimMode = false;
  trimStart: number | null = null;
  trimEnd: number | null = null;

  playlistModalVisible = false; // New property to control modal visibility

  downloadVideo(): void {
    if (!this.videoId) return;
    const url = this.ovaSdk.assets.download.full(this.videoId);
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.click();
  }

  setTrimStart(): void {
    if (this.getCurrentTimeFn) {
      this.trimStart = this.getCurrentTimeFn();
      console.log('Set Start Time:', this.trimStart);
    }
  }

  setTrimEnd(): void {
    if (this.getCurrentTimeFn) {
      this.trimEnd = this.getCurrentTimeFn();
      console.log('Set End Time:', this.trimEnd);
    }
  }

  downloadTrimmed(): void {
    if (!this.videoId || this.trimStart == null) return;
    const url = this.ovaSdk.assets.download.trim(
      this.videoId,
      this.trimStart,
      this.trimEnd ?? undefined,
    );
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

  get trimmedDuration(): number | null {
    if (
      this.trimStart != null &&
      this.trimEnd != null &&
      this.trimEnd > this.trimStart
    ) {
      return this.trimEnd - this.trimStart;
    }
    return null;
  }

  toggleTrimMode(): void {
    this.trimMode = !this.trimMode;
    if (!this.trimMode) {
      this.trimStart = null;
      this.trimEnd = null;
    }
  }

  /**
   * Opens the playlist modal.
   */
  openPlaylistModal(): void {
    this.playlistModalVisible = true;
  }

  /**
   * Closes the playlist modal.
   */
  closePlaylistModal(): void {
    this.playlistModalVisible = false;
  }
}
