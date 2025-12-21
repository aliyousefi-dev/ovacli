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

  // UI State
  infiniteMode = true;
  previewPlayback = true;
  isMiniView = false;
  useNativePlayer = false;

  // Search State
  searchQuery: string = '';

  // Theme Data
  themes = APP_THEMES;

  // Getter to filter themes based on search input
  get filteredThemes() {
    if (!this.searchQuery.trim()) {
      return this.themes;
    }
    return this.themes.filter((theme) =>
      theme.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Getter to stay in sync with the service memory
  get selectedTheme(): AppTheme {
    return this.appSettings.currentSettings.ActiveTheme;
  }

  ngOnInit() {
    this.appSettings.settings$.subscribe((settings) => {
      this.infiniteMode = settings.GalleryInfiniteMode;
      this.isMiniView = settings.GalleryMiniCardViewMode;
      this.previewPlayback = settings.GalleryPreviewPlayback;
      this.useNativePlayer = settings.useNativePlayer;
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

  toggleNativePlayer() {
    this.appSettings.updateSetting(
      'useNativePlayer',
      !this.appSettings.currentSettings.useNativePlayer
    );
  }

  toggleMiniView() {
    this.appSettings.updateSetting(
      'GalleryMiniCardViewMode',
      !this.appSettings.currentSettings.GalleryMiniCardViewMode
    );
  }

  setTheme(theme: string) {
    this.appSettings.updateSetting('ActiveTheme', theme as AppTheme);
  }
}
