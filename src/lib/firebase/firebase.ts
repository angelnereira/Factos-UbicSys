
'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

// Your web app's Firebase configuration
export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for client-side
let app: FirebaseApp;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} else {
  // This is a fallback for server-side rendering, though client-side services won't be available.
  // The main logic is designed to run in the browser.
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export { app };
