import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ViewChild, ElementRef } from '@angular/core';
import { PlaylistSummary } from '../../../../ova-angular-sdk/core-types/playlist-summary';
import { PlaylistCreateModal } from '../playlist-create-modal/playlist-create-modal';
import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

// Define PlaylistWrapper interface outside the component class
export interface PlaylistWrapper extends PlaylistSummary {
  checked: boolean;
}

@Component({
  selector: 'app-saveto-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PlaylistCreateModal],
  templateUrl: './saveto-modal.html',
})
export class SaveToModalComponent {
  @Input() selectedVideoId!: string; // Input for the video ID
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @ViewChild(PlaylistCreateModal) playlistCreateModal!: PlaylistCreateModal;

  availablePlaylist: PlaylistSummary[] = [];
  allPlaylists: PlaylistSummary[] = []; // <-- keep original list
  filterInput: string = '';

  private ovaSdk = inject(OVASDK);

  saveToPlaylist(playlistId: string) {
    this.ovaSdk.playlistContent
      .addVideoToPlaylist(this.selectedVideoId, playlistId)
      .subscribe((updatedPlaylist) => {
        this.close();
      });
  }

  openModalPlaylistCreator() {
    this.playlistCreateModal.open();
  }

  fetchPlaylists() {
    this.ovaSdk.playlists.getUserPlaylists().subscribe((p) => {
      this.allPlaylists = p.data.playlists;
      this.availablePlaylist = [...this.allPlaylists];
    });
  }

  applyFilter() {
    const query = this.filterInput.toLowerCase().trim();

    if (!query) {
      this.availablePlaylist = [...this.allPlaylists];
      return;
    }

    this.availablePlaylist = this.allPlaylists.filter((item) =>
      item.title.toLowerCase().includes(query),
    );
  }

  open() {
    this.fetchPlaylists();

    const modal: any = document.getElementById('saveToModal_1');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  close() {
    const modal: any = document.getElementById('saveToModal_1');
    if (modal && typeof modal.close === 'function') {
      modal.close();
    }
  }
}
