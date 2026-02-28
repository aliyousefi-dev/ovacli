import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs';
import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';
import { PlaylistSummary } from '../../../ova-angular-sdk/core-types/playlist-summary';

@Injectable({ providedIn: 'root' })
export class PlaylistManagerService {
  private ovaSdk = inject(OVASDK);

  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  public playlists$: Observable<PlaylistSummary[]> = this.refreshTrigger$.pipe(
    switchMap(() => this.ovaSdk.playlists.getUserPlaylists()),
    map((response) => response.data.playlists ?? []),
    shareReplay(1),
  );

  createPlaylist(title: string, desc: string) {
    return this.ovaSdk.playlists
      .createPlaylist(title, desc)
      .pipe(tap(() => this.refresh()));
  }

  deletePlaylist(playlistId: string) {
    return this.ovaSdk.playlists
      .deletePlaylist(playlistId)
      .pipe(tap(() => this.refresh()));
  }

  reorderPlaylists(ids: string[]) {
    return this.ovaSdk.playlists
      .reorderPlaylists(ids)
      .pipe(tap(() => this.refresh()));
  }

  editPlaylist(playlistId: string, title: string, description: string) {
    return this.ovaSdk.playlists
      .editPlaylist(playlistId, title, description)
      .pipe(tap(() => this.refresh()));
  }

  refresh() {
    this.refreshTrigger$.next();
  }
}
