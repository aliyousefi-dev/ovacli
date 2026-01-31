import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaylistAPIService } from '../../../../ova-angular-sdk/rest-api/playlist-api.service';
import { ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-playlist-creator-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-creator-modal.component.html',
})
export class PlaylistCreatorModal {
  @ViewChild('playlistInput') playlistInput!: HTMLInputElement;
  @ViewChild('dialog') dialog!: HTMLDialogElement;
  playlistName = '';
  creationError: string | null = null;

  @Output() created = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(private playlistApi: PlaylistAPIService) {}

  submit(): void {
    const trimmed = this.playlistName.trim();
    if (trimmed) {
      this.playlistApi
        .createUserPlaylist({
          title: trimmed,
          videoIds: [],
        })
        .subscribe({
          next: (res) => {
            if (res.status === 'success' && res.data) {
              this.created.emit(trimmed);
            } else {
              this.creationError = res.message;
            }
          },
          error: (err) => {
            if (err.error?.error?.message) {
              this.creationError = err.error.error.message;
            } else if (err.message) {
              this.creationError = err.message;
            } else {
              this.creationError =
                'Failed to create playlist. Please try again.';
            }
          },
        });

      this.playlistName = '';
    }
  }

  onConfirm() {}

  onCancel(): void {
    console.log('cancel');
    this.playlistName = '';
    this.dialog.close();
    this.cancelled.emit();
  }
}
