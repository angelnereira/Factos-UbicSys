
'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration.
// This is a public configuration and it's safe to be exposed.
// Security is enforced by Firebase Security Rules on the backend.
const firebaseConfig = {
  apiKey: "AIzaSyATnNpGkVVDXiCVJX3sBI388h5koK9iylU",
  authDomain: "studio-7875732711-2b800.firebaseapp.com",
  projectId: "studio-7875732711-2b800",
  storageBucket: "studio-7875732711-2b800.firebasestorage.app",
  messagingSenderId: "133672149206",
  appId: "1:133672149206:web:8c1729a1fc322879f36977"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore | null = null;

// This check ensures Firebase is only initialized on the client-side.
if (typeof window !== 'undefined') {
    if (getApps().length === 0) {
        // Initialize Firebase if it hasn't been initialized yet
        app = initializeApp(firebaseConfig);
    } else {
        // Use the existing app if already initialized
        app = getApp();
    }

    auth = getAuth(app);
    try {
        db = getFirestore(app);
    } catch (e) {
        console.warn("Firestore is not available. Please enable it in your Firebase project.");
        db = null;
    }
}

// @ts-ignore
export { app, auth, db };
