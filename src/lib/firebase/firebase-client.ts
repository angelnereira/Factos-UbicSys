
'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== 'undefined' && firebaseConfig.projectId) {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }

    if (app) {
        auth = getAuth(app);
        try {
            db = getFirestore(app);
        } catch (e) {
            console.warn("Firestore is not available. Please enable it in your Firebase project.");
            db = null;
        }
    }
}

export { app, auth, db };
