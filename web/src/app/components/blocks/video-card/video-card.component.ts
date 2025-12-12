import {
  Component,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SendtoModalComponent } from '../../pop-ups/sendto-modal/sendto-modal.component';

import { VideoApiService } from '../../../../ova-angular-sdk/video-api.service';
import { SavedApiService } from '../../../../ova-angular-sdk/saved-api.service';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';
import { TagLinkComponent } from '../../utility/tag-link/tag-link.component';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  standalone: true,
  styles: `.filled-icon {
    fill: #fff !important;
    stroke: none !important;
  }`,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SendtoModalComponent,
    TagLinkComponent,
  ],
})
export class VideoCardComponent implements OnChanges, OnInit {
  @Input() video!: VideoData;
  @Input() PreviewPlayback: boolean = false;
  isSaved: boolean = false;
  isWatched: boolean = false;

  @ViewChild('preview') videoElement!: ElementRef<HTMLVideoElement>;

  private observer: IntersectionObserver | null = null;

  playlistModalVisible = false;

  constructor(
    private savedapi: SavedApiService,
    private videoapi: VideoApiService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isSaved = this.video.userVideoStatus.isSaved;
    this.isWatched = this.video.userVideoStatus.isWatched;

    if (this.PreviewPlayback && this.videoElement) {
      const video_preview: HTMLVideoElement = this.videoElement.nativeElement;

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.playPreviewVideo();
            } else {
              this.stopPreviewVideo();
            }
          });
        },
        { threshold: 1 }
      );

      this.observer.observe(video_preview);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['PreviewPlayback']) {
      if (this.PreviewPlayback) {
        this.cd.detectChanges();
        setTimeout(() => {
          if (this.videoElement?.nativeElement) {
            this.ngOnInit();
          }
        }, 0);
      } else {
        this.stopPreviewVideo();
        if (this.observer) {
          this.observer.disconnect();
        }
      }
    }
  }

  // Play and Stop Preview Video
  playPreviewVideo() {
    if (this.videoElement?.nativeElement && this.PreviewPlayback) {
      const video: HTMLVideoElement = this.videoElement.nativeElement;
      video.play();
    }
  }

  stopPreviewVideo() {
    if (this.videoElement?.nativeElement && this.PreviewPlayback) {
      const video: HTMLVideoElement = this.videoElement.nativeElement;
      video.pause();
      video.currentTime = 0;
    }
  }

  // Methods for playlist and saving
  addToPlaylist(event: MouseEvent): void {
    event.stopPropagation();
    this.playlistModalVisible = true;
    this.cd.detectChanges();
  }

  closePlaylistModal(): void {
    this.playlistModalVisible = false;
    this.cd.detectChanges();
  }

  toggleSaved(event: MouseEvent): void {
    event.stopPropagation();

    if (this.isSaved) {
      this.savedapi.removeUserSaved(this.video.videoId).subscribe({
        next: () => {
          this.isSaved = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error removing from saved:', err);
        },
      });
    } else {
      this.savedapi.addUserSaved(this.video.videoId).subscribe({
        next: () => {
          this.isSaved = true;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error adding to saved:', err);
        },
      });
    }
  }

  download(event: MouseEvent): void {
    event.stopPropagation();
    const streamUrl = this.videoapi.getDownloadUrl(this.video.videoId);
    const anchor = document.createElement('a');
    anchor.href = streamUrl;
    anchor.download = `${this.video.fileName}.mp4`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  getThumbnailUrl(): string {
    return this.videoapi.getThumbnailUrl(this.video.videoId);
  }

  getPreviewUrl(): string {
    return this.videoapi.getPreviewUrl(this.video.videoId);
  }

  get videoQuality(): string {
    const width = this.video.codecs.resolution.width;
    const height = this.video.codecs.resolution.height;

    if (width >= 3840 || height >= 2160) return '4K';
    if (width >= 1920 || height >= 1080) return 'HD';
    if (width >= 1280 || height >= 720) return '720p';
    return '';
  }

  // Helper methods
  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  }

  get timeSinceAdded(): string {
    if (!this.video.uploadedAt) return 'unknown';

    const addedDate = new Date(this.video.uploadedAt);
    const now = new Date();
    const diffMs = now.getTime() - addedDate.getTime();
    if (diffMs < 0) return 'just now';

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }

  navigateToWatch(): void {
    this.router.navigate(['/watch', this.video.videoId]);
  }
}
