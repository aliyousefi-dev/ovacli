import { InjectionToken } from '@angular/core';

export interface PlayerConfig {
  ICON_FLASH_MS: number;
  SEEK_STEP: number;
  SHIFT_SEEK_STEP: number;
  VOLUME_STEP: number;
  SHIFT_VOLUME_STEP: number;
}

export const GlobalPlayerConfig = new InjectionToken<PlayerConfig>(
  'native-player.config',
  {
    providedIn: 'root',
    factory: () => ({
      ICON_FLASH_MS: 300,
      SEEK_STEP: 1,
      SHIFT_SEEK_STEP: 15,
      VOLUME_STEP: 0.01,
      SHIFT_VOLUME_STEP: 0.05,
    }),
  },
);
