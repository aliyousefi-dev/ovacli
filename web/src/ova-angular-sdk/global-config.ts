import { InjectionToken } from '@angular/core';

export interface ovaAngularSDKConfig {
  apiVersion: string;
  apiBaseUrl: string;
}

export const OVASDKConfig = new InjectionToken<ovaAngularSDKConfig>(
  'ova-angular-sdk.config',
  {
    providedIn: 'root',
    factory: () => ({
      apiVersion: 'v1',
      apiBaseUrl: '/api/v1',
    }),
  }
);
