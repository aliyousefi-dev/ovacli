import { Component, inject, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OvaAboutModalComponent } from '../../components/pop-ups/ova-about-modal/ova-about-modal.component';
import { ViewChild } from '@angular/core';
import { AuthApiService } from '../../../services/ova-backend-service/auth-api.service';
import { Router } from '@angular/router';
import { GlobalOVAConfig } from '../../../global-config';

@Component({
  selector: 'app-desktop-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, OvaAboutModalComponent],
  templateUrl: './desktop-sidebar.component.html',
})
export class DesktopSidebarComponent {
  @ViewChild(OvaAboutModalComponent) aboutModal!: OvaAboutModalComponent;

  sidebarOpen = true; // Initial state: sidebar is open
  private authapi = inject(AuthApiService);
  private router = inject(Router);
  public config = inject(GlobalOVAConfig);

  openOvaAbout() {
    this.aboutModal.open();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  OpenSearchModal(): void {
    const modal: any = document.getElementById('my_modal_2');
    const searchInput: any = document.getElementById('searchModalInput2');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();

      // Set a delay before focusing on the search input
      setTimeout(() => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
      }, 300);
    }
  }

  OpenSettingsModal(): void {
    const modal: any = document.getElementById('settings_modal');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  onLogout(): void {
    this.authapi.logout().subscribe({
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
