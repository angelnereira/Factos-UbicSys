
'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration.
// This is a public configuration and it's safe to be exposed.
// Security is enforced by Firebase Security Rules on the backend.
const firebaseConfig = {
  apiKey: "AIzaSyBx11TjLWQvQtuFbIOL753IPHRlq9K1gLI",
  authDomain: "studio-7875732711-2b800.firebaseapp.com",
  projectId: "studio-7875732711-2b800",
  storageBucket: "studio-7875732711-2b800.appspot.com",
  messagingSenderId: "7875732711",
  appId: "1:7875732711:web:dd880b435abb508215c024"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
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
