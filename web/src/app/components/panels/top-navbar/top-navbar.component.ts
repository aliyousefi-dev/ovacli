import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

import { UtilsService } from '../../../services/utils.service';
import { AuthApiService } from '../../../services/ova-backend/auth-api.service';
import { SearchBarComponent } from '../../utility/search-bar/search-bar.component';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchBarComponent],
  templateUrl: './top-navbar.component.html',
})
export class TopNavbarComponent implements OnInit {
  @Input() drawer: any;
  pageTitle: string = 'Home';
  username: string = 'Guest';
  dropdownOpen = false;
  showSettingsModal = false;
  searchBarVisible = false;

  private utilsService: UtilsService = inject(UtilsService);
  private authapi: AuthApiService = inject(AuthApiService);

  constructor(private router: Router, private location: Location) {}

  ngOnInit(): void {
    this.username = this.utilsService.getUsername() || 'Guest';
    // Subscribe to router events to detect route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getPageTitle();
      }
    });
  }

  get userInitial(): string {
    return this.username ? this.username.charAt(0).toUpperCase() : '?';
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    setTimeout(() => (this.dropdownOpen = false), 150);
  }

  openSettingsModal(): void {
    this.showSettingsModal = true;
    this.dropdownOpen = false;
  }

  closeSettingsModal(): void {
    this.showSettingsModal = false;
    this.username = this.utilsService.getUsername() || 'Guest';
  }

  // Dynamically set page title based on the route
  getPageTitle(): void {
    const currentRoute = this.location.path().split('?')[0]; // Get the route without query parameters

    // Grab the first part of the path to set it as the title
    const pathSegments = currentRoute
      .split('/')
      .filter((segment) => segment.length > 0); // Filter out any empty segments
    const firstPathSegment = pathSegments[0];

    // Capitalize the first letter of the first path segment
    const capitalizedSegment = firstPathSegment
      ? firstPathSegment.charAt(0).toUpperCase() + firstPathSegment.slice(1)
      : 'Home'; // Default to 'Home' if empty

    // Set the title dynamically
    this.pageTitle = capitalizedSegment;
  }

  onLogout(): void {
    this.authapi.logout().subscribe({
      next: () => {
        localStorage.removeItem('username');
        this.username = 'Guest';
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
    this.dropdownOpen = false;
  }

  openSearchBar(): void {
    this.searchBarVisible = true;
  }
}
