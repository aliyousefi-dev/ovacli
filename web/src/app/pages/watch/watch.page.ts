import {
  Component,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoData } from '../../../ova-angular-sdk/core-types/video-data';

import { PlayerManager } from '../../components/media-player/player-manager/player-manager';
import { VideoTitleBarComponent } from './sections/video-title-bar.component'; // Path assuming it's in the same directory as watch.page.ts
import { SimilarVideosPanelComponent } from './sections/similar-videos-panel.component';
import { VideoActionBarComponent } from './sections/video-action-bar.component';
import { WatchDetailSection } from './sections/watch-detail-section';
import { VideoAdminTabsComponent } from './sections/video-admin-tabs.component';

import { PlaylistWatchPanel } from './sections/playlist-panel';

import { ViewChild } from '@angular/core';

import { OVASDK } from '../../../ova-angular-sdk/ova-sdk';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PlayerManager,
    VideoTitleBarComponent,
    SimilarVideosPanelComponent,
    VideoAdminTabsComponent,
    WatchDetailSection,
    VideoActionBarComponent,
    PlaylistWatchPanel,
  ],
  templateUrl: './watch.page.html',
})
export class WatchPage implements AfterViewInit, OnInit {
  @ViewChild('adminTabs') adminTabs!: VideoAdminTabsComponent;

  private ovaSdk = inject(OVASDK);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  loading = true;
  error = false;
  video!: VideoData;

  playlistVideos: VideoData[] = [];

  playlistModalVisible = false;
  playlists: { title: string; slug: string; checked: boolean }[] = [];
  originalPlaylists: { title: string; slug: string; checked: boolean }[] = [];

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const videoId = params['video'];
      const playlistId = params['playlist'];

      if (playlistId) {
        this.fetchPlaylist(playlistId);
      } else {
        this.video = null as any;
        this.fetchVideo(videoId);
      }
    });
  }

  ngAfterViewInit(): void {
    window.scrollTo(0, 0);
  }

  fetchPlaylist(playlistId: string) {
    this.loading = true;
    this.ovaSdk.playlistContent
      .fetchPlaylistContent(playlistId, 1)
      .subscribe((data) => {
        const count = data.data.videos.length;
        if (count > 0) {
          this.video = data.data.videos[0];
          this.playlistVideos = data.data.videos;
        }
        this.loading = false;
      });
  }

  fetchVideo(videoId: string) {
    this.loading = true;
    this.error = false;
    this.ovaSdk.videos.getVideoById(videoId).subscribe({
      next: (response) => {
        this.video = response.data;
        this.loading = false;
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
    return this.ovaSdk.assets.stream(this.video.videoId);
  }

  get thumbnailUrl(): string {
    return this.ovaSdk.assets.thumbnail(this.video.videoId);
  }

  get storyboardVttUrl(): string {
    return this.ovaSdk.assets.previewVtt(this.video.videoId);
  }

  toggleSaved() {}
}
