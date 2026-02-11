import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerSettings } from '../data-types/player-settings';

@Injectable()
export class LocalStorageService {
  private readonly SETTINGS_KEY = 'ova_player_settings';

  private defaultSettings: PlayerSettings = {
    soundLevel: 1,
    isMuted: false,
    enableDebugger: false,
    playbackSpeed: 1,
    timeTagEnabled: false,
  };

  // 1. Create the BehaviorSubject with default values
  private settingsSubject = new BehaviorSubject<PlayerSettings>(
    this.defaultSettings,
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
    } catch (error) {
      console.error('Could not load settings', error);
    }
  }

  updateSetting<K extends keyof PlayerSettings>(
    key: K,
    value: PlayerSettings[K],
  ): void {
    // 4. Get current state, modify it, and push to the subject
    const updatedSettings = { ...this.settingsSubject.value, [key]: value };

    this.settingsSubject.next(updatedSettings);

    this.saveToStorage(updatedSettings);
  }

  private saveToStorage(settings: PlayerSettings): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Could not save settings', error);
    }
  }

  // Helper to get raw value without subscribing (useful for one-off checks)
  get currentSettings(): PlayerSettings {
    return this.settingsSubject.value;
  }
}
