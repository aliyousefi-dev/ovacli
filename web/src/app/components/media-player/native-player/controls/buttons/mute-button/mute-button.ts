// src/app/components/default-video-player/controls/mute-button/mute-button.component.ts

import { Component, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mute-button',
  standalone: true,
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
  // Local state to track the volume level (0.0 to 1.0) for the slider
  public volumeLevel: number = 1;

  // ⭐️ ADDED: Constant for the volume step size
  private readonly VOLUME_STEP: number = 0.1; // 10% change per step

  private video!: HTMLVideoElement;

  ngOnInit() {
    // Only attempt to initialize if the ElementRef is valid
    if (this.videoRef && this.videoRef.nativeElement) {
      this.video = this.videoRef.nativeElement;

      // Set initial states
      this.volumeLevel = this.video.volume;
      this.isMuted = this.video.muted;

      // Listen to the native 'volumechange' event (triggered by code or user controls)
      this.video.addEventListener('volumechange', this.updateState);
    }
  }

  ngOnDestroy() {
    // SAFETY CHECK: Only remove the listener if the video element was initialized
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

  // ---------------------------------------------
  // ⭐️ NEW: Volume Control Methods
  // ---------------------------------------------

  /**
   * Increases the volume level by the defined step, up to a maximum of 1.0.
   */
  volumeLevelUp() {
    if (!this.video) return;

    // Calculate the new volume level, ensuring it doesn't exceed 1.0
    const newVolume = this.volumeLevel + this.VOLUME_STEP;
    this.volumeLevel = Math.min(newVolume, 1.0);

    // Apply the change to the video element
    this.onVolumeChange();
  }

  /**
   * Decreases the volume level by the defined step, down to a minimum of 0.0.
   */
  volumeLevelDown() {
    if (!this.video) return;

    // Calculate the new volume level, ensuring it doesn't drop below 0.0
    const newVolume = this.volumeLevel - this.VOLUME_STEP;
    this.volumeLevel = Math.max(newVolume, 0.0);

    // Apply the change to the video element
    this.onVolumeChange();
  }

  // ---------------------------------------------
  // Existing Methods
  // ---------------------------------------------

  /**
   * Handles changes from the volume slider (via ngModel) or internal volume methods.
   */
  onVolumeChange() {
    if (this.video) {
      // 1. Update the native video volume based on the component's state
      this.video.volume = this.volumeLevel;

      // 2. Automatically handle mute based on volume level
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

    // Synchronize volume level for the slider
    // Update volumeLevel if volume > 0, or if it's 0 but not muted
    if (this.video.volume > 0) {
      this.volumeLevel = this.video.volume;
    } else if (!this.video.muted) {
      this.volumeLevel = 0;
    }
  };
}
