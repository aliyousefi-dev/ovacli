// src/app/components/media-player/native-player/controls/display-current-time/display-current-time.component.ts
import { Component, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatTime } from '../../utils/time-utils';

@Component({
  selector: 'app-display-current-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-current-time.html',
})
export class DisplayCurrentTime implements OnInit, OnDestroy {
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;

  public currentTime: number = 0;
  private video!: HTMLVideoElement;
  formatTime = formatTime;

  ngOnInit() {
    if (this.videoRef && this.videoRef.nativeElement) {
      this.video = this.videoRef.nativeElement;
      this.video.addEventListener('timeupdate', this.updateTime);
      // Initialize current time in case the video is already playing/seeked
      this.updateTime();
    }
  }

  ngOnDestroy() {
    if (this.video) {
      this.video.removeEventListener('timeupdate', this.updateTime);
    }
  }

  private updateTime = () => {
    this.currentTime = this.video?.currentTime ?? 0;
  };
}
