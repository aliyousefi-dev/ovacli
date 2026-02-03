import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';
import { GlobalFilter } from '../../../../ova-angular-sdk/rest-api/api-types/global-filter';

@Component({
  selector: 'app-global-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './global-filters.html',
})
export class GlobalFilters implements OnInit {
  private ovaSdk = inject(OVASDK);
  filters: GlobalFilter[] = [];

  ngOnInit() {
    this.ovaSdk.globalFilters.getGlobalFilters().subscribe({
      next: (response) => {
        this.filters = response.data;
      },
      error: () => {},
    });
  }
}
