import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SuggestionApiService } from '../../../../services/ova-backend-service/search-suggestion-api.service';
import { SearchSuggestionsResponse } from '../../../../services/ova-backend-service/api-responses/searchsuggestions-response';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.html',
  imports: [CommonModule, FormsModule, RouterModule],
})
export class SearchModalComponent {
  loading = false;
  searchResults: SearchSuggestionsResponse = { query: '', suggestions: [] }; // Initialize searchResults with the proper structure
  query: string = '';
  private loadingTimeout: any;
  private router = inject(Router);

  constructor(private suggestionService: SuggestionApiService) {}

  // This method will be called when the input changes
  onInput(): void {
    this.loading = true;
    clearTimeout(this.loadingTimeout);

    // Set timeout to debounce the search and stop loading after 1 second
    this.loadingTimeout = setTimeout(() => {
      this.search(); // Call the search function after the debounce time
      this.loading = false; // Stop loading after search completes
    }, 300);
  }

  // Perform the search using SuggestionApiService
  search(): void {
    if (this.query.trim().length > 0) {
      this.suggestionService.getSearchSuggestions(this.query).subscribe({
        next: (response) => {
          this.searchResults = response.data;
        },
        error: () => {
          this.searchResults = { query: this.query, suggestions: [] }; // Clear results in case of error
        },
      });
    } else {
      this.searchResults = { query: this.query, suggestions: [] }; // Clear results when query is empty
    }
  }

  // This method will be called when the Enter key is pressed
  onEnter(): void {
    if (this.query.trim().length > 0) {
      this.router.navigate(['/search'], { queryParams: { q: this.query } });
      this.CloseModal(); // Close the modal after navigating
    }
  }

  // Close modal and clear the input after a short delay
  CloseModal(): void {
    const modal: HTMLDialogElement | null = document.getElementById(
      'my_modal_2'
    ) as HTMLDialogElement;
    if (modal && typeof modal.showModal === 'function') {
      modal.close(); // Close the modal
    }

    setTimeout(() => {
      this.query = ''; // Reset the input field
      this.searchResults = { query: '', suggestions: [] }; // Optionally clear the search results
    }, 1000);
  }
}
