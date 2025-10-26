import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DesktopSidebarComponent } from '../panels/desktop-sidebar/desktop-sidebar.component';
import { TopNavbarComponent } from '../panels/top-navbar/top-navbar.component';
import { MobileDockComponent } from '../panels/mobile-dock/mobile-dock.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SearchModalComponent } from '../components/pop-ups/search-modal/search-modal';
import { PlaylistCreatorModal } from '../components/pop-ups/playlist-creator-modal/playlist-creator-modal.component';
import { SettingsModalComponent } from '../components/pop-ups/setting-modal/settings-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    DesktopSidebarComponent,
    TopNavbarComponent,
    MobileDockComponent,
    MatButtonModule,
    MatSidenavModule,
    MatPaginatorModule,
    SearchModalComponent,
    PlaylistCreatorModal,
    SettingsModalComponent,
  ],
  templateUrl: './main-app.html',
  styles: [
    `
      .sidebar-container {
        background: var(--b1);
      }

      .sidebar-sidenav {
        background: var(--b1);
        border-radius: 0px;
      }
    `,
  ],
})
export class MainApp {
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened = true;

  constructor() {
    this.updateDrawerMode();
  }

  ngOnInit() {
    this.updateDrawerMode();
    window.addEventListener('resize', this.updateDrawerMode.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateDrawerMode.bind(this));
  }

  private updateDrawerMode() {
    if (window.innerWidth < 1024) {
      this.drawerMode = 'over';
      this.drawerOpened = false;
    } else {
      this.drawerMode = 'side';
      this.drawerOpened = true;
    }
  }
}
