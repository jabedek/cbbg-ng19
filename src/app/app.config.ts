import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { getRoutes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FIRE_CONFIG } from 'firebase-cred-ignore';
import { SETTINGS, APP_SETTINGS_DIR } from './app.settings';

const routes = getRoutes(APP_SETTINGS_DIR);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: SETTINGS, useValue: APP_SETTINGS_DIR },
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(FIRE_CONFIG)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
