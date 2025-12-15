// App.tsx
import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// IMPORT SEGURO: isto pode falhar no web
let NavigationBar: typeof import("expo-navigation-bar") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  NavigationBar = require("expo-navigation-bar");
} catch {
  NavigationBar = null;
}

import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";

// -------- TEMA --------
const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#020617",
    card: "#020617",
    border: "#111827",
    primary: "#38BDF8",
    text: "#F9FAFB",
  },
};

export default function App() {
  useEffect(() => {
    if (Platform.OS !== "web" && NavigationBar) {
      NavigationBar.setBackgroundColorAsync("#020617").catch(() => {});
      NavigationBar.setButtonStyleAsync("light").catch(() => {});
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#020617" }}>
      <SafeAreaProvider>
        <StatusBar style="light" />

        <AuthProvider>
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
