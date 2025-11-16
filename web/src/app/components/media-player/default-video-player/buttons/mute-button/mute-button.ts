// src/app/components/default-video-player/controls/mute-button/mute-button.component.ts

import { Component, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- ⭐️ ADDED: Required for two-way binding on the slider

@Component({
  selector: 'app-mute-button',
  standalone: true,
  // ⭐️ UPDATED: Added FormsModule to imports
  imports: [CommonModule, FormsModule],
  templateUrl: './mute-button.html',
})
export class MuteButton implements OnInit, OnDestroy {
  /**
   * The reference to the actual <video> element from the parent component.
   */
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;

  // Local state to track if the video is currently muted
  public isMuted: boolean = false;
  // ⭐️ ADDED: Local state to track the volume level (0.0 to 1.0) for the slider
  public volumeLevel: number = 1;

  private video!: HTMLVideoElement;

  ngOnInit() {
    // Only attempt to initialize if the ElementRef is valid
    if (this.videoRef && this.videoRef.nativeElement) {
      this.video = this.videoRef.nativeElement;

      // Set initial states
      this.volumeLevel = this.video.volume; // ⭐️ ADDED: Initialize volume level
      this.isMuted = this.video.muted;

      // Listen to the native 'volumechange' event (triggered by code or user controls)
      this.video.addEventListener('volumechange', this.updateState);
    }
  }

  ngOnDestroy() {
    // ⭐ SAFETY CHECK: Only remove the listener if the video element was initialized
    if (this.video) {
      this.video.removeEventListener('volumechange', this.updateState);
    }
  }

  /**
   * Toggles the muted state of the video element.
   * This is called directly from the component's template.
   */
  toggleMute() {
    if (this.video) {
      this.video.muted = !this.video.muted;
      // The state (isMuted) will be updated automatically by the 'volumechange' listener
    }
  }

  /**
   * ⭐️ ADDED: Handles changes from the volume slider (via ngModel).
   */
  onVolumeChange() {
    if (this.video) {
      // 1. Update the native video volume based on the slider
      this.video.volume = this.volumeLevel;

      // 2. Automatically handle mute based on slider position
      if (this.volumeLevel > 0 && this.video.muted) {
        // If volume is raised, unmute
        this.video.muted = false;
      } else if (this.volumeLevel === 0 && !this.video.muted) {
        // If volume is set to 0, mute
        this.video.muted = true;
      }
    }
  }

  /**
   * Updates the local isMuted state based on the video element's properties.
   */
  private updateState = () => {
    // Synchronize mute state
    this.isMuted = this.video.muted;

    // ⭐️ UPDATED: Synchronize volume level for the slider
    // Update volumeLevel if volume > 0, or if it's 0 but not muted
    if (this.video.volume > 0) {
      this.volumeLevel = this.video.volume;
    } else if (!this.video.muted) {
      this.volumeLevel = 0;
    }
  };
}
