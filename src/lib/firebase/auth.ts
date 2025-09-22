'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type Auth,
  type AuthError,
} from 'firebase/auth';

export const signUpWithEmailAndPassword = async (auth: Auth, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};

export const loginWithEmailAndPassword = async (auth: Auth, email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};