// src/app/components/default-video-player/controls/mute-button/mute-button.component.ts

import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Ensure the correct path to your service:
import { LocalStorageService } from '../../../services/localstorage.service';
// Assuming the import for your data type is needed, or define it locally:
// import { OvaPlayerPreferences } from '../../../data-types/player-preferences-data';

// Assuming the updated interface structure for clarity:
interface OvaPlayerPreferences {
  soundLevel: number;
  isMuted: boolean; // ⭐️ NEW PROPERTY FOR MUTE STATE
}

@Component({
  selector: 'app-mute-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volume-button.html',
})
export class VolumeButton implements OnInit, OnDestroy {
  /**
   * The reference to the actual <video> element from the parent component.
   */
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;

  private localStorageService = inject(LocalStorageService);

  // Local state to track if the video is currently muted
  public isMuted: boolean = false;
  // Local state to track the volume level (0.0 to 1.0) for the slider
  public volumeLevel: number = 1;

  private readonly VOLUME_STEP: number = 0.1; // 10% change per step
  private video!: HTMLVideoElement;
  private lastKnownVolume: number = 1; // Stores the volume before muting

  ngOnInit() {
    if (this.videoRef && this.videoRef.nativeElement) {
      this.video = this.videoRef.nativeElement;

      // ⭐️ 1. LOAD: Retrieve preferences from local storage
      // Type assertion or casting helps ensure we get all properties
      const prefs =
        this.localStorageService.loadPreferences() as OvaPlayerPreferences;

      // Load both volume and mute state
      this.volumeLevel = prefs.soundLevel;
      this.isMuted = prefs.isMuted; // ⭐️ LOAD MUTE STATE

      // ⭐️ 2. INITIALIZE VIDEO ELEMENT: Set the video properties
      this.video.volume = this.volumeLevel;
      this.video.muted = this.isMuted; // ⭐️ APPLY MUTE STATE

      // Ensure lastKnownVolume is the volume level if it's > 0, otherwise default to 1
      this.lastKnownVolume = this.volumeLevel > 0 ? this.volumeLevel : 1;

      // Listen to the native 'volumechange' event
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
   */
  toggleMute() {
    if (!this.video) return;

    if (this.video.muted) {
      // UNMUTE: Restore volume to the last known non-zero value
      this.video.volume = this.lastKnownVolume;
      this.video.muted = false;
    } else {
      // MUTE: Save current volume and then set video to muted
      this.lastKnownVolume =
        this.video.volume > 0 ? this.video.volume : this.lastKnownVolume;
      this.video.muted = true;
    }

    // The 'volumechange' event listener will call updateState and save the preference.
  }

  /**
   * Increases the volume level by the defined step, up to a maximum of 1.0.
   */
  volumeLevelUp() {
    if (!this.video) return;

    // Calculate the new volume level, ensuring it doesn't exceed 1.0
    const newVolume = this.volumeLevel + this.VOLUME_STEP;
    this.volumeLevel = Math.min(newVolume, 1.0);

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

    this.onVolumeChange();
  }

  /**
   * Handles changes from the volume slider (via ngModel) or internal volume methods.
   * This is the bridge between the component state (volumeLevel) and the native video element.
   */
  onVolumeChange() {
    if (!this.video) return;

    // 1. Apply the change to the native video element
    this.video.volume = this.volumeLevel;

    // 2. Manage the muted state based on volume level
    // This is crucial for synchronizing the muted flag when the slider is moved.
    if (this.volumeLevel > 0 && this.video.muted) {
      // If volume is raised from 0, ensure it's unmuted
      this.video.muted = false;
    } else if (this.volumeLevel === 0 && !this.video.muted) {
      // If volume is set to 0, ensure it's muted
      this.video.muted = true;
    }

    // The 'volumechange' event will fire next and call updateState to save the preference.
  }

  /**
   * Updates the local component state and saves preferences after a native 'volumechange' event.
   */
  private updateState = () => {
    // 1. Synchronize component states from the native video element
    this.isMuted = this.video.muted; // ⭐️ SYNCHRONIZE MUTE STATE
    this.volumeLevel = this.video.volume;

    // 2. Update last known volume (for proper toggling)
    if (this.video.volume > 0) {
      this.lastKnownVolume = this.video.volume;
    }

    // ⭐️ 3. SAVE: Save both volume and mute state to local storage
    this.localStorageService.savePreferences({
      soundLevel: this.volumeLevel,
      isMuted: this.isMuted, // ⭐️ SAVE MUTE STATE
    } as Partial<OvaPlayerPreferences>);
  };
}
