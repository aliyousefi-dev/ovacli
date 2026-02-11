import { InjectionToken } from '@angular/core';

export interface AppConfig {
  version: string;
  features: Record<string, boolean>;
}

export const GlobalOVAConfig = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => ({
    version: 'v0.1-beta',
    features: {
      darkMode: true,
      analytics: false,
    },
  }),
});
