// src/app/components/default-video-player/controls/play-pause-button/settings-button.component.ts

import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../services/state.service';
import { MenuService } from '../../../services/menu.service';

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

  // 🌟 New State Variable
  currentView: MenuViews = 'main';

  constructor(private el: ElementRef) {}

  playerState = inject(StateService);
  playerUI = inject(MenuService);

  debuggerEnabled: boolean = false;
  tagtimeEnabled: boolean = false;
  currentPlayerSpeed: number = 1;

  ngOnInit() {
    this.playerState.currentSpeed$.subscribe((s) => {
      this.currentPlayerSpeed = s;
    });

    this.playerUI.debuggerMenuVisible$.subscribe((enabled) => {
      this.debuggerEnabled = enabled;
    });

    this.playerUI.tagTimeMenuVisible$.subscribe((enabled) => {
      this.tagtimeEnabled = enabled;
    });
  }

  setCurrentView(view: MenuViews) {
    this.currentView = view;
  }

  toggleDebuggerVisibility() {
    this.playerUI.setDebuggerMenuVisible(
      !this.playerUI.debuggerMenuVisible$.value,
    );
  }

  toggleTagTimeVisibility() {
    this.playerUI.setTagTimeMenuVisible(
      !this.playerUI.tagTimeMenuVisible$.value,
    );
  }

  /**
   * Handles setting the playback speed on the video element.
   * @param speed The desired playback rate.
   */
  setSpeed(speed: number) {
    this.playerState.setPlayRate(speed);

    this.currentView = 'main';
  }

  onDocumentClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.currentView = 'main';
    }
  }

  ngOnDestroy() {}
}
