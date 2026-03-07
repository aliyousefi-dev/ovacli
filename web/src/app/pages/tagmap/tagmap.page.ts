import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TagLinkComponent } from '../../components/etc/tag-link/tag-link.component';
import { OnInit } from '@angular/core';
import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';

@Component({
  selector: 'app-tagmap',
  standalone: true,
  templateUrl: './tagmap.page.html',
  imports: [CommonModule, TagLinkComponent],
})
export class TagMapPage implements OnInit {
  private ovaSdk = inject(OVASDK);

  tags: string[] = [];

  ngOnInit(): void {
    this.fetchTags();
  }

  fetchTags() {
    this.tags = [];
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

      // Push the sorted tags to the this.tags array
      tagsFromData.forEach((item) => {
        this.tags.push(item);
      });
    });
  }
}
