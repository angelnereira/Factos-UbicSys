
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User, getAuth, type Auth } from 'firebase/auth';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  app: null, 
  auth: null, 
  db: null 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for Firebase services
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);


  useEffect(() => {
    // This check ensures we only initialize on the client.
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // If the API key is missing, don't attempt to initialize Firebase.
    // This is crucial for production builds where env vars might not be set.
    if (firebaseConfig.apiKey) {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const authInstance = getAuth(app);
      
      let dbInstance: Firestore | null = null;
      try {
        dbInstance = getFirestore(app);
      } catch (error) {
        // Silently fail if firestore is not enabled.
        // Other parts of the app will handle the null `db` state.
        console.error("Error initializing Firestore. This may mean the service is not enabled for your project.", error);
      }

      setFirebaseApp(app);
      setAuth(authInstance);
      if (dbInstance) {
        setDb(dbInstance);
      }

      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // If config is missing, stop loading and leave auth services as null.
      // The UI will then show that the auth service is unavailable.
      console.warn("Firebase configuration is missing. Authentication will be disabled.");
      setLoading(false);
    }
  }, []);


  if (loading) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, app: firebaseApp, auth, db }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
