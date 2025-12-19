import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalFiltersApiService } from '../../../../ova-angular-sdk/rest-api/global-filters-api.service';
import { GlobalFilter } from '../../../../ova-angular-sdk/rest-api/api-types/global-filter';

@Component({
  selector: 'app-global-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './global-filters.html',
})
export class GlobalFilters implements OnInit {
  private filterapi = inject(GlobalFiltersApiService);
  filters: GlobalFilter[] = [];

  ngOnInit() {
    this.filterapi.getGlobalFilters().subscribe({
      next: (response) => {
        this.filters = response.data;
      },
      error: () => {},
    });
  }
}
