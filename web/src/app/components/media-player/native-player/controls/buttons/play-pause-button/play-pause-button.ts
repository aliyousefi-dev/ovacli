// src/app/components/default-video-player/controls/play-pause-button/play-pause-button.component.ts

import { Component, Input, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-play-pause-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './play-pause-button.html',
})
export class PlayPauseButton implements OnInit {
  /**
   * The reference to the actual <video> element from the parent component.
   */
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;

  // Local state to track if the video is currently playing/paused
  public isPlaying: boolean = false;
  private video!: HTMLVideoElement;

  ngOnInit() {
    this.video = this.videoRef.nativeElement;

    // Initial check
    this.isPlaying = !this.video.paused;

    // We must listen for play/pause events directly on the video element
    // because the state can be changed by other means (e.g., clicking the video itself).
    this.video.addEventListener('play', this.updateState);
    this.video.addEventListener('pause', this.updateState);
  }

  ngOnDestroy() {
    // Clean up event listeners
    this.video.removeEventListener('play', this.updateState);
    this.video.removeEventListener('pause', this.updateState);
  }

  /**
   * Toggles the play/pause state of the video element.
   * This is called directly from the component's template.
   */
  togglePlay() {
    if (this.video.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
    // Note: The state (isPlaying) is automatically updated by the event listeners.
  }

  /**
   * Updates the local isPlaying state based on video events.
   */
  private updateState = () => {
    this.isPlaying = !this.video.paused;
  };
}
