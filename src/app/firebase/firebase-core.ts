import { Injectable } from '@angular/core';
import { FIRE_CONFIG } from 'firebase-cred-ignore';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = FIRE_CONFIG;

const app = initializeApp(firebaseConfig);
const FirebaseAuth = getAuth(app);
const FirebaseDB = getFirestore(app);

const GoogleProvider = new GoogleAuthProvider();
GoogleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
GoogleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
GoogleProvider.addScope('https://www.googleapis.com/auth/firebase.database');
GoogleProvider.setCustomParameters({
  login_hint: 'user@example.com',
});

@Injectable({
  providedIn: 'root',
})
export class FirebaseCoreService {
  readonly __firebaseApp = app;
  readonly __firebaseAuth = FirebaseAuth;
  readonly __firebaseDB = FirebaseDB;
  readonly __googleProvider = GoogleProvider;
}
