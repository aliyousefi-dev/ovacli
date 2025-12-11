import { Injectable } from '@angular/core';
import { OvaPlayerPreferences } from '../data-types/player-preferences-data';

// 2. Define the key used in localStorage
const STORAGE_KEY = 'ova-player-preferences';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  loadPreferences(): OvaPlayerPreferences {
    try {
      // 1. Get the raw string data
      const data = localStorage.getItem(STORAGE_KEY);

      if (!data) {
        // --- START OF NEW LOGIC ---

        // 2. If no data exists, get the default settings
        const defaultPrefs = this.getDefaultPreferences();

        // 2b. SAVE the default settings to localStorage
        this.savePreferences(defaultPrefs); // Using savePreferences ensures it's JSON.stringify'd

        // 2c. Return the default settings
        return defaultPrefs;

        // --- END OF NEW LOGIC ---
      }

      // 3. Parse the JSON data
      const parsed = JSON.parse(data) as Partial<OvaPlayerPreferences>;

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
   * This function is now also used to initialize the defaults.
   * @param updates A partial object containing the keys to update or the full defaults object.
   */
  savePreferences(updates: Partial<OvaPlayerPreferences>): void {
    // NOTE: For the initialization case, 'updates' will be the full default object,
    // so loading 'currentPrefs' is unnecessary, but harmless.

    try {
      // 1. Load current preferences first (or defaults if none exist)
      const currentPrefs = this.loadPreferences();

      // 2. Merge current preferences with the new updates
      const newPrefs: OvaPlayerPreferences = {
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
  private getDefaultPreferences(): OvaPlayerPreferences {
    return {
      soundLevel: 1, // Default volume to 100%
      // Add other defaults here as you expand the interface
    };
  }
}
