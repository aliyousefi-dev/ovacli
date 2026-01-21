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
import { PlayerSettingsService } from '../../services/player-settings.service';


@Component({
  selector: 'app-mute-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volume-button.html',
})
export class VolumeButton implements OnInit, OnDestroy {
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;

  private playerSettings = inject(PlayerSettingsService)

  public isMuted: boolean = false;
  public volumeLevel: number = 1;
  public hoverPercent: number = 100;

  private video!: HTMLVideoElement;
  private lastKnownVolume: number = 1;

  ngOnInit() {
    if (this.videoRef && this.videoRef.nativeElement) {
      this.video = this.videoRef.nativeElement;

      // Load preferences with fallbacks
      this.volumeLevel = this.playerSettings.currentSettings.soundLevel;
      this.isMuted = this.playerSettings.currentSettings.isMuted;

      this.video.volume = this.volumeLevel;
      this.video.muted = this.isMuted;

      this.resetHoverPercent();

      this.lastKnownVolume = this.volumeLevel > 0 ? this.volumeLevel : 1;
      this.video.addEventListener('volumechange', this.updateState);
    }
  }

  ngOnDestroy() {
    if (this.video) {
      this.video.removeEventListener('volumechange', this.updateState);
    }
  }

  /**
   * Updates the tooltip value as the mouse moves across the slider
   */
  updateHoverPercent(event: MouseEvent) {
    const input = event.target as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percent = Math.min(Math.max(0, x / width), 1);
    this.hoverPercent = Math.round(percent * 100);
  }

  /**
   * Resets the tooltip to show the actual current volume
   */
  resetHoverPercent() {
    this.hoverPercent = Math.round(this.volumeLevel * 100);
  }

  toggleMute() {
    if (!this.video) return;
    if (this.video.muted) {
      this.video.volume = this.lastKnownVolume;
      this.video.muted = false;
    } else {
      this.lastKnownVolume =
        this.video.volume > 0 ? this.video.volume : this.lastKnownVolume;
      this.video.muted = true;
    }
  }

  /**
   * Methods called by parent component for keyboard shortcuts
   */
  volumeLevelUp(step: number) {
    if (!this.video) return;
    this.volumeLevel = Math.min(this.volumeLevel + step, 1.0);
    this.onVolumeChange();
  }

  volumeLevelDown(step: number) {
    if (!this.video) return;
    this.volumeLevel = Math.max(this.volumeLevel - step, 0.0);
    this.onVolumeChange();
  }

  /**
   * Syncs the slider/logic change to the actual video element
   */
  onVolumeChange() {
    if (!this.video) return;
    this.video.volume = this.volumeLevel;

    if (this.volumeLevel > 0 && this.video.muted) {
      this.video.muted = false;
    } else if (this.volumeLevel === 0 && !this.video.muted) {
      this.video.muted = true;
    }
    this.resetHoverPercent();
  }

  /**
   * Native event listener to keep UI in sync and save to LocalStorage
   */
  private updateState = () => {
    this.isMuted = this.video.muted;
    this.volumeLevel = this.video.volume;

    if (this.video.volume > 0) {
      this.lastKnownVolume = this.video.volume;
    }

    this.playerSettings.updateSetting("isMuted", this.isMuted)
    this.playerSettings.updateSetting("soundLevel",this.volumeLevel)

    this.resetHoverPercent();
  };
}
