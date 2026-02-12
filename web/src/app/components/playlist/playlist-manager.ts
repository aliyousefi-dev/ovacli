import { Injectable, inject } from '@angular/core';

import { OnInit } from '@angular/core';

import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';

@Injectable()
export class PlaylistManagerService implements OnInit {
  private ovaSdk = inject(OVASDK);

  ngOnInit(): void {}

  createPlaylist() {
    this.ovaSdk.playlists.createUserPlaylist('newplaylist', '', []);
  }
  deletePlaylist() {
    this.ovaSdk.playlists.deleteUserPlaylistBySlug('');
  }
  fetchPlaylists() {
    this.ovaSdk.playlists.getUserPlaylists();
  }
  clearAllPlaylists() {}
}
