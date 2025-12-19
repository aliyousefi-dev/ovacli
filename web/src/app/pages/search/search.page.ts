import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  Subscription,
  of,
  map,
} from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';

import { GalleryViewComponent } from '../../components/containers/gallery-view/gallery-view.component';
import { SearchApiService } from '../../../ova-angular-sdk/rest-api/search-api.service';
import { VideoData } from '../../../ova-angular-sdk/core-types/video-data';
import { VideoApiService } from '../../../ova-angular-sdk/rest-api/video-api.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, GalleryViewComponent],
  templateUrl: './search.page.html',
})
export class SearchPage implements OnInit, OnDestroy {
  private videoApi = inject(VideoApiService);
  private searchapi = inject(SearchApiService);
  private route = inject(ActivatedRoute);

  query: string = '';
  tagsQuery: string[] = [];

  loading: boolean = false;
  videos: VideoData[] = [];

  currentBucket: number = 1;

  totalCount: number = 0;

  // Change this subscription to listen to the URL query params for the main search
  // and remove the direct API call in ngOnInit to avoid double-fetching.
  private queryParamsSubscription!: Subscription;

  ngOnInit() {
    this.queryParamsSubscription = this.route.queryParams
      .pipe(
        debounceTime(100), // Small debounce for URL changes
        map((params: Params) => {
          // Update component state first from URL params
          this.query = params['q'] || '';
          this.tagsQuery = params['tags'] ? params['tags'].split(',') : [];
          this.currentBucket = params['bucket'] ? +params['bucket'] : 1;

          // Return the full set of parameters relevant to the API search
          return {
            query: this.query,
          };
        }),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        // Trigger the actual API search here based on URL query params
        switchMap((apiSearchState) => {
          const { query } = apiSearchState;

          const searchParams: { query?: string; tags?: string[] } = {};
          const tags = this.extractTagsFromQuery(query);
          const shouldPerformApiSearch =
            query.trim() !== '' || this.tagsQuery.length > 0;

          if (!shouldPerformApiSearch) {
            this.videos = [];
            this.totalCount = 0;
            this.loading = false;
            return of(null);
          } else {
            if (this.tagsQuery.length > 0) {
              searchParams.tags = this.tagsQuery;
            } else {
              searchParams.query = query;
              searchParams.tags = tags;
            }
          }

          this.loading = true;
          return this.searchapi.searchVideos(searchParams);
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.data?.result?.videoIds) {
            // Fetch video data based on video IDs
            this.videoApi
              .getVideosByIds(response.data.result.videoIds)
              .subscribe({
                next: (videoDataResponse) => {
                  this.videos = videoDataResponse.data || []; // Assign video data to the component
                  this.totalCount = videoDataResponse.data.length || 0;
                  this.loading = false;
                },
                error: (err) => {
                  console.error('Error fetching video data:', err);
                  this.videos = [];
                  this.totalCount = 0;
                  this.loading = false;
                },
              });
          } else {
            this.videos = [];
            this.totalCount = 0;
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error during video search:', err);
          this.videos = [];
          this.totalCount = 0;
          this.loading = false;
        },
      });
  }

  extractTagsFromQuery(query: string): string[] {
    return query
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }
}
