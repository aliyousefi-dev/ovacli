import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from '../../etc/confirm-modal/confirm-modal.component';
import { PlaylistEditModal } from '../playlist-edit-modal/playlist-edit-modal';
import { Router } from '@angular/router';
import { PlaylistSummary } from '../../../../ova-angular-sdk/core-types/playlist-summary';

import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

@Component({
  selector: 'app-playlist-card',
  imports: [CommonModule, ConfirmModalComponent, PlaylistEditModal],
  standalone: true,
  templateUrl: './playlist-card.component.html',
})
export class PlaylistCardComponent implements OnInit {
  @Input() playlist!: PlaylistSummary;
  @Output() playlistDeleted = new EventEmitter<string>();

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  // State for edit modal visibility and form values
  editModalVisible = false;
  editTitle = '';
  editDescription = '';

  private ovaSdk = inject(OVASDK);
  private router = inject(Router);

  constructor() {}

  ngOnInit(): void {}

  getThumbnailUrl(): string {
    const videoId = this.playlist.coverImageUrl
      ? this.playlist.coverImageUrl
      : null;

    return videoId ? this.ovaSdk.assets.thumbnail(videoId) : '';
  }

  goToPlaylistContent() {
    this.router.navigate(['/playlists', this.playlist.id]);
  }

  onDelete() {
    this.confirmModal.open(
      `Are you sure you want to delete the playlist "${this.playlist.title}"? This action cannot be undone.`,
    );
  }

  confirmDelete() {
    this.ovaSdk.playlists.deletePlaylist(this.playlist.id).subscribe({
      next: () => {
        this.playlistDeleted.emit(this.playlist.id);
      },
      error: (err) => {
        alert('Failed to delete playlist: ' + err.message);
      },
    });
  }

  onEdit() {
    this.editTitle = this.playlist.title;
    this.editDescription = this.playlist.description || '';
    this.editModalVisible = true;
  }

  onEditCancelled() {
    this.editModalVisible = false;
  }

  onEditSaved(update: { title: string; description: string }) {
    this.ovaSdk.playlists
      .editPlaylist(this.playlist.id, update.title, update.description)
      .subscribe({
        next: (res) => {
          if (res.status === 'success' && res.data) {
            this.playlist.title = res.data.title;
            this.playlist.description = res.data.description;
            this.editModalVisible = false;
          } else {
            alert('Failed to update playlist info');
          }
        },
        error: (err) => {
          alert('Failed to update playlist info: ' + err.message);
        },
      });
  }
}
