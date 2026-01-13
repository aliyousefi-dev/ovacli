// src/app/components/default-video-player/controls/play-pause-button/settings-button.component.ts

import { Component, Input, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Define a type for your menu states for clarity
type MenuViews = 'main' | 'playback';

@Component({
  selector: 'app-settings-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-button.html', // Now using settings-button.html
  // Add host listener to reset view when menu closes (optional but recommended)
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class SettingsButton implements OnInit {
  /**
   * The reference to the actual <video> element from the parent component.
   */
  @Input({ required: true }) videoRef!: ElementRef<HTMLVideoElement>;

  // 🌟 New State Variable
  currentView: MenuViews = 'main';

  constructor(private el: ElementRef) {}

  ngOnInit() {}

  /**
   * Updates the current menu view.
   */
  setCurrentView(view: MenuViews) {
    this.currentView = view;
  }

  toggleDebuggerVisibility() {
    console.log('debugger clicked');
  }

  /**
   * Handles setting the playback speed on the video element.
   * @param speed The desired playback rate.
   */
  setSpeed(speed: number) {
    this.videoRef.nativeElement.playbackRate = speed;

    this.currentView = 'main';
  }

  onDocumentClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.currentView = 'main';
    }
  }

  ngOnDestroy() {}
}
