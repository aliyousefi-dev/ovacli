import {
  Component,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  OnInit,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SendtoModalComponent } from '../../pop-ups/sendto-modal/sendto-modal.component';
import { VideoApiService } from '../../../../ova-angular-sdk/rest-api/video-api.service';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';

@Component({
  selector: 'app-mini-video-card',
  templateUrl: './mini-video-card.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SendtoModalComponent],
})
export class MiniVideoCardComponent implements OnChanges, OnInit {
  @Input() video!: VideoData;
  @Input() PreviewPlayback: boolean = false;
  @ViewChild('preview') videoElement!: ElementRef<HTMLVideoElement>;

  isSaved: boolean = false;
  isWatched: boolean = false;

  private videoApiService = inject(VideoApiService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    this.isSaved = this.video.userVideoStatus.isSaved;
    this.isWatched = this.video.userVideoStatus.isWatched;

    if (this.PreviewPlayback && this.videoElement) {
      const video_preview: HTMLVideoElement = this.videoElement.nativeElement;

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.PlayPreviewVideo();
            } else {
              this.StopPreviewVideo();
            }
          });
        },
        { threshold: 0.9 }
      );

      this.observer.observe(video_preview);
    }
  }

  // Updated ngOnChanges
  ngOnChanges(changes: SimpleChanges) {
    if (changes['PreviewPlayback']) {
      if (this.PreviewPlayback) {
        this.cd.detectChanges(); // Ensure change detection to make videoElement ready
        setTimeout(() => {
          if (this.videoElement?.nativeElement) {
            this.ngOnInit(); // Re-initialize observer safely
          }
        }, 0);
      } else {
        this.StopPreviewVideo(); // Stop video when PreviewPlayback is false
        if (this.observer) {
          this.observer.disconnect(); // Disconnect observer when no longer needed
        }
      }
    }
  }

  playlistModalVisible = false;

  getThumbnailUrl(): string {
    return this.videoApiService.getThumbnailUrl(this.video.videoId);
  }

  getPreviewUrl(): string {
    return this.videoApiService.getPreviewUrl(this.video.videoId);
  }

  get videoQuality(): string {
    const width = this.video.codecs.resolution.width;
    const height = this.video.codecs.resolution.height;

    if (width >= 3840 || height >= 2160) return '4K';
    if (width >= 1920 || height >= 1080) return 'HD';
    if (width >= 1280 || height >= 720) return '720p';
    return '';
  }

  addToPlaylist(event: MouseEvent): void {
    event.stopPropagation();
    this.playlistModalVisible = true;
    this.cd.detectChanges();
  }

  StopPreviewVideo() {
    if (this.videoElement?.nativeElement && this.PreviewPlayback) {
      const video: HTMLVideoElement = this.videoElement.nativeElement;
      video.pause();
      video.currentTime = 0;
    }
  }

  PlayPreviewVideo() {
    if (this.videoElement?.nativeElement && this.PreviewPlayback) {
      const video: HTMLVideoElement = this.videoElement.nativeElement;
      video.play();
    }
  }

  closePlaylistModal(): void {
    this.playlistModalVisible = false;
    this.cd.detectChanges();
  }

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

  navigateToWatch(): void {
    this.router.navigate(['/watch', this.video.videoId]);
  }
}
