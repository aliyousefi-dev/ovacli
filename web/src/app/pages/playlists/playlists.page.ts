import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ConfirmModalComponent } from '../../components/etc/confirm-modal/confirm-modal.component';

import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';
import { PlaylistSummary } from '../../../ova-angular-sdk/core-types/playlist-summary';
import { Router } from '@angular/router';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './playlists.page.html',
})
export class PlaylistsPage implements OnInit {
  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  private ovaSdk = inject(OVASDK);
  private router = inject(Router);

  playlists: PlaylistSummary[] = [];
  filteredPlaylists: PlaylistSummary[] = [];
  filterInput: string = '';
  playlistToRemove?: PlaylistSummary;

  getThumbnailUrl(videoId: string): string {
    const url = this.ovaSdk.assets.thumbnail(videoId);
    return url;
  }

  navigateToWatch(playlistId: string) {
    this.router.navigate(['/watch'], {
      queryParams: { playlist: playlistId },
    });
  }

  applyFilter() {
    const query = this.filterInput.toLowerCase().trim();

    if (!query) {
      this.filteredPlaylists = [...this.playlists];
      return;
    }

    this.filteredPlaylists = this.playlists.filter((item) =>
      item.title.toLowerCase().includes(query),
    );
  }

  fetchUserPlaylists() {
    this.ovaSdk.playlists.getUserPlaylists().subscribe((playlist) => {
      this.playlists = playlist.data.playlists;
      this.filteredPlaylists = this.playlists;
    });
  }

  initiatePlaylistRemoval(playlist: PlaylistSummary): void {
    // Open the confirmation modal with a specific message
    this.playlistToRemove = playlist;
    this.confirmModal.open(
      `Are you sure you want to delete "${playlist.title}"? This action cannot be undone.`,
    );
  }

  onConfirmPlaylistRemoval(): void {
    if (!this.playlistToRemove) {
      return;
    }
    this.ovaSdk.playlists
      .deletePlaylist(this.playlistToRemove.id)
      .subscribe(() => {
        this.fetchUserPlaylists();
      });
  }

  ngOnInit(): void {
    this.fetchUserPlaylists();
  }
}
