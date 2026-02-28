import {
  Component,
  OnInit,
  ViewChild,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PlaylistGridComponent } from '../playlists-view/playlists-view.component';
import { PlaylistCreateModal } from '../playlist-create-modal/playlist-create-modal';
import { ConfirmModalComponent } from '../../etc/confirm-modal/confirm-modal.component';
import { PlaylistEditModal } from '../playlist-edit-modal/playlist-edit-modal';
import { PlaylistSummary } from '../../../../ova-angular-sdk/core-types/playlist-summary';
import { PlaylistManagerService } from '../playlist-manager';

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

  private playlistManager = inject(PlaylistManagerService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.playlistManager.playlists$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pl) => {
        this.playlists = pl;
        this.loading = false;
      });
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedPlaylists.clear();
    if (checked) {
      this.playlists.forEach((p) => this.selectedPlaylists.add(p.id));
    }
    this.selectedPlaylists = new Set(this.selectedPlaylists);
  }

  toggleManageMode(): void {
    this.manageMode = !this.manageMode;
  }

  onSelectionChange(event: { id: string; selected: boolean }): void {
    if (event.selected) {
      this.selectedPlaylists.add(event.id);
    } else {
      this.selectedPlaylists.delete(event.id);
    }
    this.selectedPlaylists = new Set(this.selectedPlaylists);
  }

  onPlaylistDeleted(id: string): void {
    this.selectedPlaylists.delete(id);
  }

  onDeleteButton(): void {
    this.confirmModal.open(
      `Are you sure you want to delete all selected playlists? This action cannot be undone.`,
    );
  }

  confirmDelete(): void {
    this.selectedPlaylists.forEach((id) => {
      this.playlistManager.deletePlaylist(id).subscribe({
        next: () => {},
        error: (err) => alert('Failed to delete playlist: ' + err.message),
      });
    });
    this.selectedPlaylists.clear();
  }

  openCreatePlaylistModal(): void {
    this.playlistCreateModal.open();
  }
}
