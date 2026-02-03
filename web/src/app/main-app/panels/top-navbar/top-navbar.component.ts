import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-navbar.component.html',
})
export class TopNavbarComponent implements OnInit {
  @Input() drawer: any;
  pageTitle: string = 'Home';
  username: string = 'Guest';
  dropdownOpen = false;
  showSettingsModal = false;
  searchBarVisible = false;

  constructor(
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit(): void {
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

  OpenSettingsModal(): void {
    const modal: any = document.getElementById('settings_modal');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
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
}
