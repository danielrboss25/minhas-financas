// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const unsub = onAuthStateChanged(auth, (u) => {
    console.log("[AUTH] state changed:", u ? { uid: u.uid, email: u.email } : null);
    setUser(u);
    setLoading(false);
  });
  return () => unsub();
}, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }

  async function register(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
  }

  async function logout() {
    await signOut(auth);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth tem de ser usado dentro de AuthProvider.");
  return ctx;
}
