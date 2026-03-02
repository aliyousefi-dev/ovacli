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
      data.data.forEach((item) => {
        this.tags.push(item.name);
      });
    });
  }
}
