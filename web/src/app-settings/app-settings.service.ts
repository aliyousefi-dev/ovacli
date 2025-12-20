import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettings } from './app-settings';

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
  private readonly SETTINGS_KEY = 'app_user_settings';

  private defaultSettings: AppSettings = {
    ActiveTheme: 'light',
    GalleryInfiniteMode: false,
    GalleryMiniCardViewMode: true,
    GalleryPreviewPlayback: false,
  };

  // 1. Create the BehaviorSubject with default values
  private settingsSubject = new BehaviorSubject<AppSettings>(
    this.defaultSettings
  );

  // 2. Expose as an Observable so components can subscribe
  // The '$' suffix is a naming convention for Observables
  settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(this.SETTINGS_KEY);
      let currentSettings = this.defaultSettings;

      if (saved) {
        currentSettings = { ...this.defaultSettings, ...JSON.parse(saved) };
      }

      // 3. Update the Subject with loaded data
      this.settingsSubject.next(currentSettings);
      this.applyTheme(currentSettings.ActiveTheme);
    } catch (error) {
      console.error('Could not load settings', error);
      this.applyTheme(this.defaultSettings.ActiveTheme);
    }
  }

  updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): void {
    // 4. Get current state, modify it, and push to the subject
    const updatedSettings = { ...this.settingsSubject.value, [key]: value };

    this.settingsSubject.next(updatedSettings);

    if (key === 'ActiveTheme') {
      this.applyTheme(value as string);
    }

    this.saveToStorage(updatedSettings);
  }

  private saveToStorage(settings: AppSettings): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Could not save settings', error);
    }
  }

  private applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Helper to get raw value without subscribing (useful for one-off checks)
  get currentSettings(): AppSettings {
    return this.settingsSubject.value;
  }
}
