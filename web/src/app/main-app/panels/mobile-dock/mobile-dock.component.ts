import { Component, ViewChild, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { SearchModalComponent } from '../../../components/etc/search-modal/search-modal';

@Component({
  selector: 'app-mobile-dock',
  standalone: true,
  imports: [CommonModule, RouterModule, MatRippleModule, SearchModalComponent],
  templateUrl: './mobile-dock.component.html',
  styleUrls: ['./mobile-dock.component.css'],
})
export class MobileDockComponent {
  @ViewChild('searchModal') searchModal!: SearchModalComponent;

  private router = inject(Router);

  OpenSearchModal(): void {
    this.searchModal.openModal();
  }

  // Method to check if the current route is active
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
