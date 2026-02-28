import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { LoadingService } from '../services/loading.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DeleteAlert } from './components/etc/delete-alert/delete-alert';
import { GlobalSettingsService } from './global/global-settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatProgressBarModule, DeleteAlert],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  globalService = inject(GlobalSettingsService);

  loading$ = this.loadingService.loading$;
  isNotFoundRoute: boolean = false;

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.hide();
      }

      if (
        event instanceof NavigationError ||
        event instanceof NavigationCancel
      ) {
        this.isNotFoundRoute = true; // Set the flag for 404 when error occurs
      } else {
        this.isNotFoundRoute = false; // Reset if valid route
      }
    });
  }
}
