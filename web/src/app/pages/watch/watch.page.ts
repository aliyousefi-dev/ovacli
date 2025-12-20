import {
  Component,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VideoData } from '../../../ova-angular-sdk/core-types/video-data';
import { VideoApiService } from '../../../ova-angular-sdk/rest-api/video-api.service';
import { SavedApiService } from '../../../ova-angular-sdk/rest-api/saved-api.service';
import { PlaylistAPIService } from '../../../ova-angular-sdk/rest-api/playlist-api.service';
import { WatchedApiService } from '../../../ova-angular-sdk/rest-api/recent-api.service';
import { VidstackPlayerComponent } from '../../components/media-player/vidstack-player/vidstack-player.component';
import { NativePlayer } from '../../components/media-player/native-player/native-player';
import { AppSettingsService } from '../../../app-settings/app-settings.service';

// Updated: Import new child components
import { VideoTitleBarComponent } from './sections/video-title-bar.component'; // Path assuming it's in the same directory as watch.page.ts
import { SimilarVideosPanelComponent } from './sections/similar-videos-panel.component';
import { VideoActionBarComponent } from './sections/video-action-bar.component';
import { WatchDetailSection } from './sections/watch-detail-section';
import { VideoAdminTabsComponent } from './sections/video-admin-tabs.component';
import { PlaylistContentAPIService } from '../../../ova-angular-sdk/rest-api/playlist-content-api.service';

import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VidstackPlayerComponent,
    NativePlayer,
    VideoTitleBarComponent,
    SimilarVideosPanelComponent,
    VideoAdminTabsComponent,
    WatchDetailSection,
    VideoActionBarComponent,
  ],
  templateUrl: './watch.page.html',
})
export class WatchPage implements AfterViewInit, OnInit {
  @ViewChild('vidstackPlayer') vidstackPlayer!: VidstackPlayerComponent;
  @ViewChild('adminTabs') adminTabs!: VideoAdminTabsComponent;

  private appSettings = inject(AppSettingsService);
  private activatedRoute = inject(ActivatedRoute);
  private savedApiService = inject(SavedApiService);
  private videoApiService = inject(VideoApiService);
  private playlistApiService = inject(PlaylistAPIService);
  private watchedApiService = inject(WatchedApiService);
  private playlistContentApiService = inject(PlaylistContentAPIService);
  private cd = inject(ChangeDetectorRef);

  // true -> use vidstack player; false -> use native player
  useVidstack = true;
  loading = true;
  error = false;
  videoId: string | null = null;
  video!: VideoData;
  isSaved = false;
  loadingSavedVideo = false;
  username = '';

  selectedTab: 'tag' | 'marker' = 'tag'; // default

  playlistModalVisible = false;
  playlists: { title: string; slug: string; checked: boolean }[] = [];
  originalPlaylists: { title: string; slug: string; checked: boolean }[] = [];

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const newId = params['videoId'];
      if (newId) {
        this.video = null as any;
        this.videoId = newId;
        this.fetchVideo(newId);
      }
    });

    this.appSettings.settings$.subscribe((settings) => {
      this.useVidstack = !settings.useNativePlayer;
    });
  }

  getCurrentTimeFromPlayer = () => this.vidstackPlayer.getCurrentTime();

  ngAfterViewInit(): void {
    window.scrollTo(0, 0);

    // Load tab from localStorage
    const savedTab = localStorage.getItem('watch-selected-tab');
    if (savedTab === 'marker' || savedTab === 'tag') {
      this.selectedTab = savedTab;
    }
  }

  fetchVideo(videoId: string) {
    this.loading = true;
    this.error = false;
    this.videoApiService.getVideoById(videoId).subscribe({
      next: (response) => {
        this.video = response.data;
        (window as any).video = this.video; // Consider removing this if not debugging
        this.loading = false;
        this.username = localStorage.getItem('username') ?? '';

        if (this.username && this.videoId) {
          this.watchedApiService
            .addUserWatched(this.username, this.videoId)
            .subscribe({
              next: () => {
                console.log('Video marked as watched!');
              },
              error: (err) => {
                console.error('Failed to mark video as watched:', err);
              },
            });
        }
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  persistTab(tab: 'tag' | 'marker') {
    localStorage.setItem('watch-selected-tab', tab);
  }

  get videoUrl(): string {
    return this.videoApiService.getStreamUrl(this.video.videoId);
  }

  get thumbnailUrl(): string {
    return this.videoApiService.getThumbnailUrl(this.video.videoId);
  }

  get storyboardVttUrl(): string {
    return this.videoApiService.getPreviewThumbsUrl(this.video.videoId);
  }

  toggleSaved() {
    if (!this.username || !this.videoId) return;

    this.loadingSavedVideo = true;

    const done = () => (this.loadingSavedVideo = false);

    if (this.isSaved) {
      this.savedApiService.removeUserSaved(this.videoId).subscribe({
        next: () => {
          this.isSaved = false;
          done();
        },
        error: () => done(),
      });
    } else {
      this.savedApiService.addUserSaved(this.videoId).subscribe({
        next: () => {
          this.isSaved = true;
          done();
        },
        error: () => done(),
      });
    }
  }

  addToPlaylist(event: MouseEvent) {
    event.stopPropagation();
    if (!this.username || !this.video) return;

    this.playlistApiService.getUserPlaylists().subscribe((response) => {
      const pls = response.data.playlists;
      const checkList = pls.map((p) => ({ ...p, checked: false }));

      Promise.all(
        checkList.map(
          (playlist) =>
            new Promise<void>((resolve) => {
              this.playlistContentApiService
                .fetchPlaylistContent(playlist.slug)
                .subscribe((plData) => {
                  playlist.checked = plData.data.videoIds.includes(
                    this.video.videoId
                  );
                  resolve();
                });
            })
        )
      ).then(() => {
        this.playlists = checkList;
        this.originalPlaylists = checkList.map((p) => ({ ...p }));
        this.playlistModalVisible = true;
        this.cd.detectChanges();
      });
    });
  }

  closePlaylistModal(
    updatedPlaylists: { title: string; slug: string; checked: boolean }[]
  ) {
    this.playlistModalVisible = false;
    if (!this.username || !this.video) return;

    updatedPlaylists.forEach((playlist) => {
      const original = this.originalPlaylists.find(
        (p) => p.slug === playlist.slug
      );
      if (!original) return;

      if (playlist.checked && !original.checked) {
        this.playlistContentApiService
          .addVideoToPlaylist(playlist.slug, this.video.videoId)
          .subscribe();
      } else if (!playlist.checked && original.checked) {
        this.playlistContentApiService
          .deleteVideoFromPlaylist(playlist.slug, this.video.videoId)
          .subscribe();
      }
    });
  }
}
