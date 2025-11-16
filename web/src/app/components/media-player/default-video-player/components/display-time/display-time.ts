// src/app/components/default-video-player/controls/display-time/display-time.component.ts

import { Component, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import your shared utility function
import { formatTime } from '../../utils/time-utils';

@Component({
  selector: 'app-display-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-time.html',
})
export class DisplayTime implements OnInit, OnDestroy {
  /**
   * Input: The reference to the actual <video> element from the parent component.
   */
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;

  // Local state properties
  public currentTime: number = 0;
  public videoDuration: number = 0;
  private video!: HTMLVideoElement;

  // Make the utility function available in the template
  formatTime = formatTime;

  ngOnInit() {
    if (this.videoRef && this.videoRef.nativeElement) {
      this.video = this.videoRef.nativeElement;

      // Listen for time updates and metadata loading
      this.video.addEventListener('timeupdate', this.updateTime);
      this.video.addEventListener('loadedmetadata', this.updateDuration);

      // Initialize duration (in case metadata loaded before ngOnInit)
      this.updateDuration();
    }
  }

  ngOnDestroy() {
    // Safety check for cleanup
    if (this.video) {
      this.video.removeEventListener('timeupdate', this.updateTime);
      this.video.removeEventListener('loadedmetadata', this.updateDuration);
    }
  }

  /**
   * Updates the current time state when the video plays.
   */
  private updateTime = () => {
    // Use Math.floor for integer seconds display
    this.currentTime = this.video.currentTime;
  };

  /**
   * Updates the total duration state when video metadata loads.
   */
  private updateDuration = () => {
    // Ensure duration is finite before assigning
    const duration = this.video.duration;
    this.videoDuration = isFinite(duration) ? duration : 0;
  };
}
