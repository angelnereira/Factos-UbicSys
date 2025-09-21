import { getAuth, createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import app from './firebase';

const auth = getAuth(app);

export const signUpWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
};
