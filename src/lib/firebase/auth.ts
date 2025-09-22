'use client';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type AuthError } from 'firebase/auth';
import { auth } from './firebase-client'; // Updated import

export const signUpWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};

export const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error as AuthError };
    }
};

export { auth };
