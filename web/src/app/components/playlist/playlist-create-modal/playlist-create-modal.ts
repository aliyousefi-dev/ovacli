import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaylistManagerService } from '../playlist-manager';

@Component({
  selector: 'playlist-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-create-modal.html',
})
export class PlaylistCreateModal {
  // Use ElementRef for the dialog to avoid document.getElementById
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('playlistInput') playlistInput!: ElementRef<HTMLInputElement>;

  playlistName = '';
  creationError: string | null = null;
  isLoading = false;

  private playlistManager = inject(PlaylistManagerService);

  submit(): void {
    const trimmed = this.playlistName.trim();
    if (!trimmed || this.isLoading) return;

    this.isLoading = true;
    this.creationError = null;

    this.playlistManager.createPlaylist(trimmed, '').subscribe({
      next: () => {
        this.isLoading = false;
        this.playlistName = '';
        this.close(); // Close only on success
      },
      error: (err) => {
        this.isLoading = false;
        this.creationError =
          err.error?.message || err.message || 'Failed to create playlist';
      },
    });
  }

  open() {
    this.dialog.nativeElement.showModal();
    // Focus the input automatically when opened
    setTimeout(() => this.playlistInput.nativeElement.focus(), 10);
  }

  close() {
    this.dialog.nativeElement.close();
    this.playlistName = '';
    this.creationError = null;
  }
}
