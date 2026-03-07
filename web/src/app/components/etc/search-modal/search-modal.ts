import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { QuickSearchResponse } from '../../../../ova-angular-sdk/rest-api/api-types/quick-search-response';
import { ViewChild, ElementRef } from '@angular/core';
import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.html',
  imports: [CommonModule, FormsModule, RouterModule],
})
export class SearchModalComponent {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  private router = inject(Router);
  private ovaSdk = inject(OVASDK);

  loading = false;
  quickSearchResults: QuickSearchResponse = { query: '', suggestions: [] }; // Initialize searchResults with the proper structure
  query: string = '';
  private loadingTimeout: any;

  // This method will be called when the input changes
  onInput(): void {
    this.loading = true;
    clearTimeout(this.loadingTimeout);

    // Set timeout to debounce the search and stop loading after 1 second
    this.loadingTimeout = setTimeout(() => {
      this.quickSearch(); // Call the search function after the debounce time
      this.loading = false; // Stop loading after search completes
    }, 300);
  }

  // Perform the search using SuggestionApiService
  quickSearch(): void {
    if (this.query.trim().length > 0) {
      this.ovaSdk.searchSuggestion.quickSearch(this.query).subscribe({
        next: (response) => {
          this.quickSearchResults = response.data;
        },
        error: () => {
          this.quickSearchResults = { query: this.query, suggestions: [] }; // Clear results in case of error
        },
      });
    } else {
      this.quickSearchResults = { query: this.query, suggestions: [] }; // Clear results when query is empty
    }
  }

  // This method will be called when the Enter key is pressed
  onEnter(): void {
    if (this.query.trim().length > 0) {
      const trimmedQuery = this.query.trim();
      const tags = trimmedQuery;

      this.router.navigate(['/search'], {
        queryParams: { q: trimmedQuery, tags },
      });
      this.CloseModal(); // Close the modal after navigating
    }
  }

  openModal() {
    console.log('open');
    this.dialog.nativeElement.showModal();
    const searchInput: any = document.getElementById('searchModalInput2');
    // Set a delay before focusing on the search input
    setTimeout(() => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
    }, 300);
  }

  // Close modal and clear the input after a short delay
  CloseModal(): void {
    const modal: HTMLDialogElement | null = document.getElementById(
      'searchModal',
    ) as HTMLDialogElement;
    if (modal && typeof modal.showModal === 'function') {
      modal.close(); // Close the modal
    }

    setTimeout(() => {
      this.query = ''; // Reset the input field
      this.quickSearchResults = { query: '', suggestions: [] }; // Optionally clear the search results
    }, 1000);
  }
}
