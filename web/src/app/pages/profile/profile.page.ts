import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { VideoData } from '../../../ova-angular-sdk/core-types/video-data';
import { VideoApiService } from '../../../ova-angular-sdk/rest-api/video-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProfileHeaderSection } from './sections/profile-header/profile-header';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ProfileHeaderSection, FormsModule, CommonModule],
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit, AfterViewInit, OnDestroy {
  // All existing properties and methods remain here
  copied = false;
  copyButtonLabel = 'Copy space ID to clipboard';
  SpaceSelected = 'root';
  allVideos: VideoData[] = [];
  videos: VideoData[] = [];
  loading = true;
  searchTerm = '';
  currentFolder = '';
  sortOption = 'titleAsc';
  currentPage = 1;
  limit = 20;
  totalPages = 1;

  private routerSubscription: Subscription | undefined;
  @ViewChild('videoGridContainer') videoGridContainer!: ElementRef;
  isMobile = false;

  constructor(
    private videoapi: VideoApiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.currentPage = +(params.get('page') ?? 1);
      this.searchTerm = params.get('search') ?? '';
      this.sortOption = params.get('sort') ?? 'titleAsc';
      const folderParam = params.get('folder');
      this.currentFolder = folderParam !== null ? folderParam : '';
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        sessionStorage.setItem('videoListScroll', window.scrollY.toString());
      }
    });
  }

  ngAfterViewInit() {
    const scrollY = sessionStorage.getItem('videoListScroll');
    if (scrollY) {
      setTimeout(() => {
        window.scrollTo({
          top: +scrollY!,
          behavior: 'smooth',
        });
        sessionStorage.removeItem('videoListScroll');
      }, 50);
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  copySpaceId() {
    const spaceId = '#sdkfjs23kdsflkjdsf';
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(spaceId).then(() => {
        this.copied = true;
        this.copyButtonLabel = 'Copied!';
        setTimeout(() => {
          this.copied = false;
          this.copyButtonLabel = 'Copy space ID to clipboard';
        }, 1200);
      });
    }
  }
}
