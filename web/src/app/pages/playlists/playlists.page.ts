import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';
import { PlaylistSummary } from '../../../ova-angular-sdk/core-types/playlist-summary';
import { Router } from '@angular/router';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playlists.page.html',
})
export class PlaylistsPage implements OnInit {
  private ovaSdk = inject(OVASDK);
  private router = inject(Router);

  playlists: PlaylistSummary[] = [];

  getThumbnailUrl(videoId: string): string {
    const url = this.ovaSdk.assets.thumbnail(videoId);
    return url;
  }

  navigateToWatch(playlistId: string) {
    this.router.navigate(['/watch'], {
      queryParams: { playlist: playlistId },
    });
  }

  ngOnInit(): void {
    this.ovaSdk.playlists.getUserPlaylists().subscribe((playlist) => {
      this.playlists = playlist.data.playlists;
    });
  }
}
