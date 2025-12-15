// src/navigation/RootNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./AuthStack";
import AppNavigator from "./AppNavigator";

import { useAuth } from "../context/AuthContext";
import { MealsProvider } from "../context/MealsContext";
import { MovimentosProvider } from "../context/MovimentosContext";
import { IdeasProvider } from "../context/IdeasContext";

type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <RootStack.Navigator id="root" screenOptions={{ headerShown: false }}>
      {user ? (
        <RootStack.Screen name="App">
          {() => (
            <MealsProvider>
              <MovimentosProvider>
                <IdeasProvider>
                  <AppNavigator />
                </IdeasProvider>
              </MovimentosProvider>
            </MealsProvider>
          )}
        </RootStack.Screen>
      ) : (
        <RootStack.Screen name="Auth" component={AuthStack} />
      )}
    </RootStack.Navigator>
  );
}
