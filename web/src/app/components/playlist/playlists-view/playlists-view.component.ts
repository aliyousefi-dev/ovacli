import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { PlaylistCardComponent } from '../playlist-card/playlist-card.component';
import { CommonModule } from '@angular/common';
import { PlaylistSummary } from '../../../../ova-angular-sdk/core-types/playlist-summary';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { PlaylistManagerService } from '../playlist-manager';

@Component({
  selector: 'app-playlists-view',
  templateUrl: './playlists-view.component.html',
  imports: [PlaylistCardComponent, CommonModule, DragDropModule],
  styleUrls: ['./playlists-view.component.css'],
})
export class PlaylistGridComponent {
  @Input() playlists: PlaylistSummary[] = [];
  @Input() manageMode = false;
  @Input() selectedIds = new Set<string>();

  @Output() selectionChange = new EventEmitter<{
    id: string;
    selected: boolean;
  }>();
  @Output() playlistDeleted = new EventEmitter<string>();

  private playlistManager = inject(PlaylistManagerService);

  drop(event: CdkDragDrop<PlaylistSummary[]>): void {
    moveItemInArray(this.playlists, event.previousIndex, event.currentIndex);
    const newOrderSlugs = this.playlists.map((pl) => pl.id);
    this.playlistManager
      .reorderPlaylists(newOrderSlugs)
      .pipe(
        catchError((err) => {
          console.error('Failed to update playlist order:', err);
          return of(null);
        }),
      )
      .subscribe();
  }

  togglePlaylistSelection(slug: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectionChange.emit({ id: slug, selected: checked });
  }

  onSelect(_title: string): void {
    // Selection state is managed by parent when manageMode is on
  }

  isChecked(slug: string): boolean {
    return this.selectedIds.has(slug);
  }

  OnPlaylistDeleted(deletedSlug: string): void {
    this.playlistDeleted.emit(deletedSlug);
  }
}
