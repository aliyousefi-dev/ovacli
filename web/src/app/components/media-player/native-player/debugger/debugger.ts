// src/app/components/default-video-player/controls/full-screen-button/full-screen-button.component.ts

import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerSettingsService } from '../services/player-settings.service';

@Component({
  selector: 'app-debugger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Assuming the template is full-screen-button.component.html or full-screen-button.html
  templateUrl: './debugger.html',
})
export class ScreenDebugger implements AfterViewInit,OnInit, OnDestroy {
  @Input({ required: true }) htmlPlayer!: ElementRef<HTMLVideoElement>;

  enableDebugger: boolean = false;

  currentTime: number = 0;
  volume: number = 0;
  isMuted: boolean = false;
  speed: number = 1;
  duration: number = 0;
  isPlaying: boolean = false;
  resolution: string = '';
  buffered: number = 0;

  private playerSettings = inject(PlayerSettingsService)

ngOnInit(): void {
  this.playerSettings.settings$.subscribe((s) => {
    this.enableDebugger = s.enableDebugger;
  })
}

  ngAfterViewInit() {
    console.log('debugger view init');

    this.htmlPlayer.nativeElement.addEventListener(
      'timeupdate',
      this.onTimeChanged
    );

    this.htmlPlayer.nativeElement.addEventListener(
      'play',
      () => (this.isPlaying = true)
    );

    this.htmlPlayer.nativeElement.addEventListener(
      'pause',
      () => (this.isPlaying = false)
    );

    this.htmlPlayer.nativeElement.addEventListener(
      'loadedmetadata',
      this.onMetadataLoaded
    );

    this.htmlPlayer.nativeElement.addEventListener('progress', () => {
      let bf = this.htmlPlayer.nativeElement.buffered;
      let length = 0;

      for (let i = 0; i < bf.length; i++) {
        const start = bf.start(i);
        const end = bf.end(i);
        let minus = end - start;
        length += minus;
      }

      this.buffered = Math.trunc(length);
    });

    this.htmlPlayer.nativeElement.addEventListener(
      'volumechange',
      this.onVolumeChanged
    );

    this.htmlPlayer.nativeElement.addEventListener(
      'ratechange',
      this.onSpeedChanged
    );
  }

  ngOnDestroy() {
    this.htmlPlayer.nativeElement.removeEventListener(
      'timeupdate',
      this.onTimeChanged
    );
  }

  private onMetadataLoaded = () => {
    this.isPlaying = !this.htmlPlayer.nativeElement.paused;
    this.resolution =
      this.htmlPlayer.nativeElement.videoWidth.toString() +
      'x' +
      this.htmlPlayer.nativeElement.videoHeight.toString();
    this.onTimeChanged();
    this.onVolumeChanged();
    this.onSpeedChanged();
    this.duration = Math.trunc(this.htmlPlayer.nativeElement.duration);
  };

  private onTimeChanged = () => {
    this.currentTime = Math.trunc(this.htmlPlayer.nativeElement.currentTime);
  };

  private onVolumeChanged = () => {
    this.isMuted = this.htmlPlayer.nativeElement.muted;
    this.volume = Math.trunc(this.htmlPlayer.nativeElement.volume * 100);
  };

  private onSpeedChanged = () => {
    this.speed = this.htmlPlayer.nativeElement.playbackRate;
  };
}
