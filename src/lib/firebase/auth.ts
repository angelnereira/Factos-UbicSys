'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  type UserCredential,
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

export const signInWithGoogle = async (auth: Auth): Promise<{ result: UserCredential | null; isNewUser: boolean; error: AuthError | null; }> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const additionalInfo = getAdditionalUserInfo(result);
    return { result, isNewUser: !!additionalInfo?.isNewUser, error: null };
  } catch (error) {
    return { result: null, isNewUser: false, error: error as AuthError };
  }
};
