import {
  ApplicationConfig,
  provideExperimentalZonelessChangeDetection,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideZoneChangeDetection({ eventCoalescing: true }),
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'cbbg-2024',
        appId: '1:592100183356:web:448a20fd1027b022742239',
        storageBucket: 'cbbg-2024.firebasestorage.app',
        apiKey: 'AIzaSyCSb2u138CcMlWqHWMqses0BdLfzyTwySY',
        authDomain: 'cbbg-2024.firebaseapp.com',
        messagingSenderId: '592100183356',
        measurementId: 'G-QGYNFST8PN',
      }),
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
