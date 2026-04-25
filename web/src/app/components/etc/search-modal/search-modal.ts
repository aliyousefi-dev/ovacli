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
  quickSearchResults: QuickSearchResponse = { query: '', results: [] }; // Initialize searchResults with the proper structure
  query: string = '';
  private loadingTimeout: any;

  searchTypeTags: boolean = true;
  searchTypeVideo: boolean = true;
  searchTypeMarker: boolean = true;

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
      this.ovaSdk.quickSearch.quickSearch(this.query).subscribe({
        next: (response) => {
          this.quickSearchResults = response.data;
        },
        error: () => {
          this.quickSearchResults = { query: this.query, results: [] }; // Clear results in case of error
        },
      });
    } else {
      this.quickSearchResults = { query: this.query, results: [] }; // Clear results when query is empty
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
    setTimeout(() => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
    }, 300);
  }

  CloseModal(): void {
    const modal: HTMLDialogElement | null = document.getElementById(
      'searchModal',
    ) as HTMLDialogElement;
    if (modal && typeof modal.showModal === 'function') {
      modal.close(); // Close the modal
    }

    setTimeout(() => {
      this.query = ''; // Reset the input field
      this.quickSearchResults = { query: '', results: [] }; // Optionally clear the search results
    }, 1000);
  }

  getFilteredResultsCount(): number {
    if (
      !this.quickSearchResults ||
      !this.quickSearchResults.results ||
      this.quickSearchResults.results.length === 0
    ) {
      return 0;
    }

    return this.quickSearchResults.results.filter((result: any) => {
      if (result.type === 'video' && this.searchTypeVideo) return true;
      if (result.type === 'tag' && this.searchTypeTags) return true;
      if (result.type === 'marker' && this.searchTypeMarker) return true;
      return false;
    }).length;
  }
}
