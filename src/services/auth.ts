// src/services/auth.ts
import { auth } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInAnonymously,
} from "firebase/auth";

export function subscribeAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function register(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function logout() {
  return signOut(auth);
}

export async function loginAnonymous() {
  return signInAnonymously(auth);
}
