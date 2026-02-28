import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettings } from './app-settings';

@Injectable({ providedIn: 'root' })
export class GlobalSettingsService implements OnInit {
  private readonly SETTINGS_KEY = 'app_user_settings';

  private defaultSettings: AppSettings = {
    ActiveTheme: 'light',
    GalleryInfiniteMode: true,
    GalleryMiniCardViewMode: true,
    GalleryPreviewPlayback: false,
    useNativePlayer: true,
  };

  // 1. Create the BehaviorSubject with default values
  private settingsSubject = new BehaviorSubject<AppSettings>(
    this.defaultSettings,
  );

  settings$ = this.settingsSubject.asObservable();

  constructor() {
    console.log('construct');
    this.loadSettings();
  }

  ngOnInit(): void {
    console.log('init');
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
    value: AppSettings[K],
  ): void {
    const updatedSettings = { ...this.settingsSubject.value, [key]: value };

    this.settingsSubject.next(updatedSettings);

    if (key === 'ActiveTheme') {
      this.applyTheme(value as string);
    }

    this.saveToStorage(updatedSettings);
  }

  private applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  private saveToStorage(settings: AppSettings): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Could not save settings', error);
    }
  }

  get currentSettings(): AppSettings {
    return this.settingsSubject.value;
  }
}
