import { Injectable, inject } from '@angular/core';

import { OnInit } from '@angular/core';

import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';
import { BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlaylistManagerService {
  private ovaSdk = inject(OVASDK);

  // 1. A trigger to signal when we need to reload data
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  // 2. A clean, declarative data stream
  // This pipe runs every time refreshTrigger emits.
  public playlists$ = this.refreshTrigger$.pipe(
    switchMap(() => this.ovaSdk.playlists.getUserPlaylists()),
    map((response) => response.data.playlists),
    shareReplay(1), // Keeps the data in memory for multiple components
  );

  /**
   * We use the constructor for initialization, not ngOnInit
   */
  constructor() {
    // Initial load happens automatically because refreshTrigger has a default value
  }

  createPlaylist(title: string, desc: string) {
    // Return the observable so the component can show a "loading" spinner
    return this.ovaSdk.playlists.createPlaylist(title, desc).pipe(
      tap(() => this.refresh()), // Trigger a reload after success
    );
  }

  deletePlaylist(playlistId: string) {
    return this.ovaSdk.playlists
      .deletePlaylist(playlistId)
      .pipe(tap(() => this.refresh()));
  }

  /**
   * Simply calling .next() on the trigger forces playlists$ to update
   */
  public refresh() {
    this.refreshTrigger$.next();
  }
}
