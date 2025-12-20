import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppSettingsService } from '../../../../../../app-settings/app-settings.service';
import { AppTheme, APP_THEMES } from '../../../../../../app-settings/themes';

@Component({
  selector: 'app-settings-appearance-tab',
  standalone: true,
  templateUrl: './settings-appearance-tab.html',
  imports: [CommonModule, FormsModule],
})
export class SettingsAppearanceTab implements OnInit {
  private appSettings = inject(AppSettingsService);

  infiniteMode = true; // Default to infinite mode, you can change based on preference
  previewPlayback = true; // Default for preview playback
  isMiniView = false; // Default to full view

  // Use the central list from your themes.ts file
  themes = APP_THEMES;

  // Getter to stay in sync with the service memory
  get selectedTheme(): AppTheme {
    return this.appSettings.currentSettings.ActiveTheme;
  }

  ngOnInit() {
    this.appSettings.settings$.subscribe((settings) => {
      this.infiniteMode = settings.GalleryInfiniteMode;
      this.isMiniView = settings.GalleryMiniCardViewMode;
      this.previewPlayback = settings.GalleryPreviewPlayback;
    });
  }

  toggleInfiniteMode() {
    this.appSettings.updateSetting(
      'GalleryInfiniteMode',
      !this.appSettings.currentSettings.GalleryInfiniteMode
    );
  }

  togglePreviewPlayback() {
    this.appSettings.updateSetting(
      'GalleryPreviewPlayback',
      !this.appSettings.currentSettings.GalleryPreviewPlayback
    );
  }

  toggleMiniView() {
    this.appSettings.updateSetting(
      'GalleryMiniCardViewMode',
      !this.appSettings.currentSettings.GalleryMiniCardViewMode
    );
  }

  setTheme(theme: string) {
    // We cast to AppTheme because the UI usually passes a string
    this.appSettings.updateSetting('ActiveTheme', theme as AppTheme);
  }
}
