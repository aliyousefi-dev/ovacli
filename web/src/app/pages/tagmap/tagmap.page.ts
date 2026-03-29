import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TagLinkComponent } from '../../components/etc/tag-link/tag-link.component';
import { OnInit } from '@angular/core';
import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';

@Component({
  selector: 'app-tagmap',
  standalone: true,
  templateUrl: './tagmap.page.html',
  imports: [CommonModule, TagLinkComponent, FormsModule],
})
export class TagMapPage implements OnInit {
  private ovaSdk = inject(OVASDK);

  fetchedTags: string[] = [];
  filteredTags: string[] = []; // Tags to be displayed after filtering
  filterInput: string = ''; // Property to hold the user's filter input

  ngOnInit(): void {
    this.fetchTags();
  }

  fetchTags() {
    this.fetchedTags = [];
    this.ovaSdk.globalFilters.getGlobalFilters().subscribe((data) => {
      const tagsFromData = data.data.tags;

      // Sort the tags alphabetically
      tagsFromData.sort((a, b) => {
        const nameA = a.toUpperCase(); //Case-insensitive sorting
        const nameB = b.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      this.fetchedTags = [...tagsFromData]; // Store all sorted tags
      this.filteredTags = [...this.fetchedTags]; // Initially, display all tags
    });
  }

  applyFilter() {
    if (!this.filterInput) {
      this.filteredTags = [...this.fetchedTags]; // If input is empty, show all tags
      return;
    }

    const filterLower = this.filterInput.toLowerCase();
    this.filteredTags = this.fetchedTags.filter((tag) =>
      tag.toLowerCase().includes(filterLower),
    );
  }
}
