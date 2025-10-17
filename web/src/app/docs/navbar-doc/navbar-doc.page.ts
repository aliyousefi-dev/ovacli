import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OvaVersionComponent } from '../../components/utility/ova-version/ova-version.component';
import { OverviewNavDocComponent } from '../overview-nav/overview-nav.page';
import { WebComponentNavDocComponent } from '../web-components-nav/web-components-nav.page';
import { BreadcrumbsService } from '../breadcrumbs-service/breadcrumbs-service';
import { RestAPINavDocComponent } from '../rest-api-nav/rest-api-nav.page';
import { GoRefrencesNavDocComponent } from '../go-refrences-nav/go-refrences-nav.page';
import { CollabrationNavDocComponent } from '../collabration-nav/collabration-nav.page';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar-doc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    OvaVersionComponent,
    OverviewNavDocComponent,
    WebComponentNavDocComponent,
    GoRefrencesNavDocComponent,
    RestAPINavDocComponent,
    CollabrationNavDocComponent,
  ],
  templateUrl: './navbar-doc.page.html',
})
export class NavbarDocComponent implements OnInit, OnDestroy {
  private breadcrumbsService = inject(BreadcrumbsService);
  private breadcrumbsSub?: Subscription;
  breadcrumbs: string[] = [];

  ngOnInit() {
    this.breadcrumbsSub = this.breadcrumbsService
      .getBreadcrumbs()
      .subscribe((breadcrumbs) => {
        this.breadcrumbs = breadcrumbs;
        console.log('Breadcrumbs:', breadcrumbs);
      });
  }

  ngOnDestroy() {
    this.breadcrumbsSub?.unsubscribe();
  }
}
