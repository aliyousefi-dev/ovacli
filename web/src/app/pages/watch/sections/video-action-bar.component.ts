import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaveToModalComponent } from '../../../components/playlist/saveto-modal/saveto-modal';
import { RouterModule } from '@angular/router';
import { ConfirmModalComponent } from '../../../components/etc/confirm-modal/confirm-modal.component';

import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

import { ViewChild } from '@angular/core';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';

@Component({
  selector: 'app-video-action-bar',
  standalone: true,
  imports: [
    CommonModule,
    SaveToModalComponent,
    RouterModule,
    ConfirmModalComponent,
  ], // Add PlaylistModalComponent to imports
  templateUrl: './video-action-bar.component.html',
  styles: [],
})
export class VideoActionBarComponent implements OnInit {
  @ViewChild(SaveToModalComponent) saveToModal!: SaveToModalComponent;
  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  @Input() videoData!: VideoData;
  @Input() getCurrentTimeFn?: () => number;

  @Input() loadingSavedVideo = false;

  private ovaSdk = inject(OVASDK);

  isSaved = false;
  trimMode = false;
  trimStart: number | null = null;
  trimEnd: number | null = null;

  playlistModalVisible = false; // New property to control modal visibility

  ngOnInit(): void {
    this.fetchSaved();
  }

  fetchSaved() {
    this.ovaSdk.saved.getUserSaved(1).subscribe((data) => {
      this.isSaved = data.data.videos.some(
        (video) => video.videoId === this.videoData.videoId,
      );
    });
  }

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

  toggleSaved(): void {
    if (!this.isSaved) {
      this.ovaSdk.saved
        .addUserSaved(this.videoData.videoId)
        .subscribe((data) => {
          console.log('ok');
          this.fetchSaved();
        });
    } else {
      this.ovaSdk.saved
        .removeUserSaved(this.videoData.videoId)
        .subscribe((data) => {
          console.log('ok');
          this.fetchSaved();
        });
    }
  }

  initiateVideoRemoval(): void {
    // Open the confirmation modal with a specific message
    this.confirmModal.open(
      `Are you sure you want to delete "${this.videoData.title}"? This action cannot be undone.`,
    );
  }

  // Handler for when the user confirms deletion in the modal
  onConfirmVideoRemoval(): void {
    // Call the SDK method to delete the video
    this.ovaSdk.videos.deleteVideoById(this.videoData.videoId).subscribe({
      next: () => {
        console.log('Video deleted successfully!');
        // Optionally: Emit an event to notify parent components, refresh lists, etc.
        // this.videoDeleted.emit(this.videoData.videoId);
      },
      error: (err) => {
        console.error('Error deleting video:', err);
        // Handle error display to the user (e.g., show a toast notification)
      },
    });
  }
}
