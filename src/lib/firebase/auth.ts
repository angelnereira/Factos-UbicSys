'use client';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type AuthError } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export const signUpWithEmailAndPassword = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};

export const loginWithEmailAndPassword = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};
