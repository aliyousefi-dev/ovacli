import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnInit,
  inject,
  AfterViewInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';

import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

@Component({
  selector: 'app-mini-video-card',
  templateUrl: './mini-video-card.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class MiniVideoCardComponent implements OnInit, AfterViewInit {
  @Input() video!: VideoData;
  @Input() isHovered: boolean = false;
  @ViewChild('preview') videoElement!: ElementRef<HTMLVideoElement>;

  isSaved: boolean = false;
  isWatched: boolean = false;
  isLoading: boolean = false;

  private router = inject(Router);
  private ovaSdk = inject(OVASDK);

  ngOnInit() {
    this.isSaved = this.video.userVideoStatus.isSaved;
    this.isWatched = this.video.userVideoStatus.isWatched;
  }

  ngAfterViewInit(): void {
    this.videoElement.nativeElement.addEventListener('loadedmetadata', () => {
      setTimeout(() => {
        this.isLoading = false;
      }, 500);

      this.videoElement.nativeElement.play();
    });
  }

  onMouseEnter() {
    this.isHovered = true;
    this.isLoading = true;
    this.videoElement.nativeElement.load();
  }

  onMouseLeave() {
    this.isHovered = false;
    this.isLoading = false;
    this.videoElement.nativeElement.pause();
    this.videoElement.nativeElement.currentTime = 0;
  }

  getThumbnailUrl(): string {
    return this.ovaSdk.assets.thumbnail(this.video.videoId);
  }

  getPreviewUrl(): string {
    return this.ovaSdk.assets.preview(this.video.videoId);
  }

  get videoQuality(): string {
    const width = this.video.codecs.resolution.width;
    const height = this.video.codecs.resolution.height;

    if (width >= 3840 || height >= 2160) return '4K';
    if (width >= 1920 || height >= 1080) return 'HD';
    if (width >= 1280 || height >= 720) return '720p';
    return '';
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
