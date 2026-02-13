import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PlaylistSummary } from '../../../../ova-angular-sdk/core-types/playlist-summary';

import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

// Define PlaylistWrapper interface outside the component class
export interface PlaylistWrapper extends PlaylistSummary {
  checked: boolean;
}

@Component({
  selector: 'app-sendto-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sendto-modal.component.html',
})
export class SendtoModalComponent implements OnChanges {
  @Input() showModal = false;
  @Input() selectedVideoId!: string; // Input for the video ID
  // @Input() username!: string; // Removed: username will now be fetched via UtilsService

  // Internal state for playlists
  playlists: PlaylistWrapper[] = [];
  originalPlaylists: PlaylistWrapper[] = []; // To track initial state for comparison
  loading = false; // <-- new flag

  @Output() close = new EventEmitter<void>(); // No longer emits data, just signals closure

  private username: string | null = null; // Internal property to store the fetched username

  private ovaSdk = inject(OVASDK);
  private router = inject(Router);

  // ngOnChanges will detect changes to input properties
  ngOnChanges(changes: SimpleChanges): void {
    // Check if showModal changed to true and selectedVideoId is available
    // Also ensure username is available before loading playlists
    if (
      changes['showModal'] &&
      changes['showModal'].currentValue === true &&
      this.selectedVideoId &&
      this.username
    ) {
    }
    // If showModal changes to false, clear playlists or reset state
    if (changes['showModal'] && changes['showModal'].currentValue === false) {
      this.playlists = [];
      this.originalPlaylists = [];
    }
  }

  /**
   * Closes the modal without saving changes.
   */
  closeModal(): void {
    this.close.emit(); // Just emit close event
  }

  /**
   * Saves changes to playlists by adding/removing the video.
   */

  /**
   * Tracks playlists by slug for NgFor optimization.
   */
  trackBySlug(index: number, playlist: { slug: string }): string {
    return playlist.slug;
  }

  /**
   * Navigates to the playlists management page.
   */
  navigateToPlaylists(): void {
    this.router.navigate(['/playlists']);
  }
}
