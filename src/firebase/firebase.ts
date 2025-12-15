// src/firebase/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

import { getAuth, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

let analytics: any = null;

const firebaseConfig = {
  apiKey: "AIzaSyCajhDAMNyIWFnGnEonHlV110ZUfkNx5_I",
  authDomain: "minhas-finan-103cb.firebaseapp.com",
  projectId: "minhas-finan-103cb",
  storageBucket: "minhas-finan-103cb.firebasestorage.app",
  messagingSenderId: "741961747634",
  appId: "1:741961747634:web:d3e2ddce86d737e4080dab",
  measurementId: "G-KY07VGNC5B",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

if (Platform.OS === "web") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getAnalytics } = require("firebase/analytics");
  analytics = getAnalytics(app);
}

function getRnPersistence() {
  // Preferir o entrypoint React Native, que é onde a função vive “a sério”.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rn = require("firebase/auth/react-native");
    return rn.getReactNativePersistence(AsyncStorage);
  } catch {
    // Fallback: tentar no módulo base (há versões onde funciona).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const base = require("firebase/auth");
    if (typeof base.getReactNativePersistence !== "function") {
      throw new Error(
        "getReactNativePersistence não está disponível. Confirma a versão do firebase e limpa caches."
      );
    }
    return base.getReactNativePersistence(AsyncStorage);
  }
}

export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getRnPersistence(),
      });

export const db = getFirestore(app);
export { analytics };
