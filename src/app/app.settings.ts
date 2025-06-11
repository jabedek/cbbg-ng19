import { InjectionToken } from '@angular/core';

export const APP_SETTINGS_DIR = {
  USE_REAL_AUTH: false,
  USE_REAL_GAMES: false,
  // ...
};

export type APP_SETTINGS = typeof APP_SETTINGS_DIR;

export const SETTINGS = new InjectionToken<APP_SETTINGS>('app.additional_settings');
