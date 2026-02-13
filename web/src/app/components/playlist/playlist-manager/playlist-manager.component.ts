import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PlaylistGridComponent } from '../playlists-view/playlists-view.component';
import { PlaylistCreateModal } from '../playlist-create-modal/playlist-create-modal';
import { ConfirmModalComponent } from '../../etc/confirm-modal/confirm-modal.component';
import { PlaylistEditModal } from '../playlist-edit-modal/playlist-edit-modal';
import { PlaylistSummary } from '../../../../ova-angular-sdk/core-types/playlist-summary';

import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

@Component({
  selector: 'app-playlist-manager',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PlaylistGridComponent,
    ConfirmModalComponent,
    PlaylistCreateModal,
    PlaylistEditModal,
  ],
  templateUrl: './playlist-manager.component.html',
})
export class PlaylistManagerComponent implements OnInit {
  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;
  @ViewChild(PlaylistCreateModal) playlistCreateModal!: PlaylistCreateModal;

  manageMode = false;

  loading = true;
  playlists: PlaylistSummary[] = [];
  selectedPlaylists = new Set<string>();
  selectedPlaylistTitle: string | null = null;

  private ovaSdk = inject(OVASDK);

  ngOnInit(): void {
    this.FetchPlaylists();
  }

  private FetchPlaylists(): void {
    this.ovaSdk.playlists.getUserPlaylists().subscribe({
      next: (response) => {
        this.playlists = response.data.playlists ?? [];
        this.sortPlaylists();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load playlists:', err);
        this.loading = false;
      },
    });
  }

  private sortPlaylists(): void {
    this.playlists.sort(
      (a, b) => (a.orderPosition ?? 0) - (b.orderPosition ?? 0),
    );
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedPlaylists.clear();
    if (checked) {
      this.playlists.forEach((p) => this.selectedPlaylists.add(p.id));
    }
    console.log(this.selectedPlaylists);
  }

  toggleManageMode(): void {
    this.manageMode = !this.manageMode;
  }

  onDeleteButton() {
    this.confirmModal.open(
      `Are you sure you want to delete all selected playlists? This action cannot be undone.`,
    );
  }

  confirmDelete() {
    this.selectedPlaylists.forEach((playlist_slug) => {
      this.ovaSdk.playlists.deletePlaylist(playlist_slug).subscribe({
        next: () => {
          this.handlePlaylistDeleted(playlist_slug);
        },
        error: (err) => {
          alert('Failed to delete playlist: ' + err.message);
        },
      });
    });
  }

  handlePlaylistDeleted(deletedSlug: string) {
    this.playlists = this.playlists.filter((pl) => pl.id !== deletedSlug);
    this.selectedPlaylists.delete(deletedSlug);
    if (this.selectedPlaylistTitle) {
      const deletedPlaylist = this.playlists.find(
        (pl) => pl.title === this.selectedPlaylistTitle,
      );
      if (!deletedPlaylist) {
        this.selectedPlaylistTitle = null;
      }
    }
  }

  openCreatePlaylistModal(): void {
    this.playlistCreateModal.open();
  }

  onPlaylistCreated(title: string): void {
    this.FetchPlaylists();
  }
}
