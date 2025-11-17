import { Injectable } from '@angular/core';
import { PlayerPreferences } from '../data-types/player-preferences-data';

// 2. Define the key used in localStorage
const STORAGE_KEY = 'videoPlayerPrefs';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  loadPreferences(): PlayerPreferences {
    try {
      // 1. Get the raw string data
      const data = localStorage.getItem(STORAGE_KEY);

      if (!data) {
        // 2. If no data exists, return the default settings
        return this.getDefaultPreferences();
      }

      // 3. Parse the JSON data
      const parsed = JSON.parse(data) as Partial<PlayerPreferences>;

      // 4. Combine parsed data with defaults to ensure all keys exist
      return {
        ...this.getDefaultPreferences(),
        ...parsed,
      };
    } catch (e) {
      console.error('Error loading preferences from localStorage', e);
      // 5. Fallback to default preferences on error
      return this.getDefaultPreferences();
    }
  }

  /**
   * Saves specific preferences to localStorage by merging with existing data.
   * This ensures we only update the keys we care about without overwriting others.
   * @param updates A partial object containing the keys to update.
   */
  savePreferences(updates: Partial<PlayerPreferences>): void {
    try {
      // 1. Load current preferences first
      const currentPrefs = this.loadPreferences();

      // 2. Merge current preferences with the new updates
      const newPrefs: PlayerPreferences = {
        ...currentPrefs,
        ...updates,
      };

      // 3. Save the stringified merged object
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    } catch (e) {
      console.error('Error saving preferences to localStorage', e);
    }
  }

  /**
   * Provides the default settings for the player.
   */
  private getDefaultPreferences(): PlayerPreferences {
    return {
      soundLevel: 1, // Default volume to 50%
    };
  }
}
