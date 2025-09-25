
'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyATnNpGkVVDXiCVJX3sBI388h5koK9iylU",
  authDomain: "studio-7875732711-2b800.firebaseapp.com",
  projectId: "studio-7875732711-2b800",
  storageBucket: "studio-7875732711-2b800.appspot.com",
  messagingSenderId: "133672149206",
  appId: "1:133672149206:web:d6b5e3a8c1f3d274577e9d",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// This check is crucial for client-side execution.
if (typeof window !== 'undefined') {
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
