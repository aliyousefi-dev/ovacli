import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ViewChild, ElementRef } from '@angular/core';
import { PlaylistSummary } from '../../../../ova-angular-sdk/core-types/playlist-summary';
import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

// Define PlaylistWrapper interface outside the component class
export interface PlaylistWrapper extends PlaylistSummary {
  checked: boolean;
}

@Component({
  selector: 'app-saveto-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './saveto-modal.component.html',
})
export class SendtoModalComponent implements OnChanges {
  @Input() showModal = false;
  @Input() selectedVideoId!: string; // Input for the video ID
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  // Internal state for playlists
  playlists: PlaylistWrapper[] = [];
  originalPlaylists: PlaylistWrapper[] = []; // To track initial state for comparison
  loading = false; // <-- new flag

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

  open() {
    this.dialog.nativeElement.showModal();
  }

  close() {
    this.dialog.nativeElement.close();
  }

  trackBySlug(index: number, playlist: { slug: string }): string {
    return playlist.slug;
  }

  navigateToPlaylists(): void {
    this.router.navigate(['/playlists']);
  }
}
