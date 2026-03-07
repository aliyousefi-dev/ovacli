import { Component, inject, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OvaAboutModalComponent } from '../../../components/etc/ova-about-modal/ova-about-modal.component';
import { ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalOVAConfig } from '../../../global/global-config';
import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';
import { SearchModalComponent } from '../../../components/etc/search-modal/search-modal';
import { RepoInfo } from '../../../../ova-angular-sdk/rest-api/api-types/repo-info';

@Component({
  selector: 'app-desktop-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OvaAboutModalComponent,
    SearchModalComponent,
  ],
  templateUrl: './desktop-sidebar.component.html',
})
export class DesktopSidebarComponent implements OnInit {
  @ViewChild(OvaAboutModalComponent) aboutModal!: OvaAboutModalComponent;
  @ViewChild('searchModal') searchModal!: SearchModalComponent;

  sidebarOpen = true; // Initial state: sidebar is open
  private ovaSdk = inject(OVASDK);
  private router = inject(Router);
  public config = inject(GlobalOVAConfig);

  repositoryInfo!: RepoInfo;

  ngOnInit(): void {
    this.ovaSdk.repo.getRepoInfo().subscribe((data) => {
      this.repositoryInfo = data.data.info;
    });
  }

  openOvaAbout() {
    this.aboutModal.open();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  OpenSearchModal(): void {
    this.searchModal.openModal();
  }

  OpenSettingsModal(): void {
    const modal: any = document.getElementById('settings_modal');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  onLogout(): void {
    this.ovaSdk.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Check for Ctrl+K or Cmd+K
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); // Prevent the default behavior (e.g., browser search)
      this.OpenSearchModal(); // Call your method to open the modal
    }
  }
}
