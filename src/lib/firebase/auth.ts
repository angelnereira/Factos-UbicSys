import { createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthError, getAuth } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);


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
