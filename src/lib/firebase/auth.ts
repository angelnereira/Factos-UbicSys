import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, type Auth, type AuthError } from 'firebase/auth';
import { app } from './firebase';

let auth: Auth;
if (typeof window !== 'undefined') {
  auth = getAuth(app);
}

export const signUpWithEmailAndPassword = async (email: string, password: string) => {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};

export const loginWithEmailAndPassword = async (email: string, password: string) => {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error as AuthError };
    }
};

export { auth };
