// src/app/components/media-player/native-player/controls/display-total-time/display-total-time.component.ts
import { Component, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatTime } from '../../utils/time-utils';

@Component({
  selector: 'app-display-total-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-total-time.html',
})
export class DisplayTotalTime implements OnInit, OnDestroy {
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;

  public videoDuration: number = 0;
  private video!: HTMLVideoElement;
  formatTime = formatTime;

  ngOnInit() {
    if (this.videoRef && this.videoRef.nativeElement) {
      this.video = this.videoRef.nativeElement;
      this.video.addEventListener('loadedmetadata', this.updateDuration);
      // Initialize duration if metadata already loaded
      this.updateDuration();
    }
  }

  ngOnDestroy() {
    if (this.video) {
      this.video.removeEventListener('loadedmetadata', this.updateDuration);
    }
  }

  private updateDuration = () => {
    const duration = this.video?.duration ?? 0;
    this.videoDuration = Number.isFinite(duration) ? duration : 0;
  };
}
