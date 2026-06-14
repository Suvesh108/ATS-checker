// ─── Firebase Web SDK Configuration ──────────────────────────────────────────
// These are the PUBLIC web config values (safe to commit - NOT the admin SDK keys)

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDJJyJzZYqTiweHwnCy5hXScoThweofNB4",
  authDomain: "ats-checker-cab8e.firebaseapp.com",
  projectId: "ats-checker-cab8e",
  storageBucket: "ats-checker-cab8e.appspot.com",
  messagingSenderId: "",   // optional for auth-only usage
  appId: "",               // optional for auth-only usage
};

// Prevent re-initialization on hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signupWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logout = () => {
  localStorage.removeItem('token');
  return signOut(auth);
};

/** Persist the Firebase ID token in localStorage so api.ts can grab it */
export const initAuthListener = (onReady: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
      // Refresh token every 50 min (tokens expire after 60)
      setInterval(async () => {
        const fresh = await user.getIdToken(true);
        localStorage.setItem('token', fresh);
      }, 50 * 60 * 1000);
    } else {
      localStorage.removeItem('token');
    }
    onReady(user);
  });
};
