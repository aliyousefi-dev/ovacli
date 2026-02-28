import { InjectionToken } from '@angular/core';

export interface ovaAngularSDKConfig {
  apiBaseUrl: string;
  wsUrl: string;
}

export const OVASDKConfig = new InjectionToken<ovaAngularSDKConfig>(
  'ova-angular-sdk.config',
  {
    providedIn: 'root',
    factory: () => ({
      apiBaseUrl: '/api/v1',
      wsUrl: 'ws://localhost:8081/ws',
    }),
  },
);
