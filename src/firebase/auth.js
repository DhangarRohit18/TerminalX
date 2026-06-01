import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile } from './firestore';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signUpWithEmail = async (email, password, displayName) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await createUserProfile(cred.user);
  return cred.user;
};

export const signInWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const signInWithGoogle = async () => {
  const cred = await signInWithPopup(auth, googleProvider);
  await createUserProfile(cred.user);
  return cred.user;
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const logOut = async () => {
  await signOut(auth);
};
