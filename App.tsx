// App.tsx
import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Wallet,
  CheckSquare,
  Utensils,
  Lightbulb,
  Home as HomeIcon,
} from "lucide-react-native";

import HomeScreen from "./src/screens/home";
import FinanceScreen from "./src/screens/Finance";
import TasksScreen from "./src/screens/tasks";
import MealsScreen from "./src/screens/Meals";
import IdeasScreen from "./src/screens/Ideas";
import NovaMovimentacaoScreen from "./src/screens/NovaMovimentacao";
import DetalhesMovimentoScreen from "./src/screens/DetalhesMovimento";
import { MovimentosProvider } from "./src/context/MovimentosContext";

// --------- TIPOS DA NAVEGAÇÃO ---------
export type FinancasStackParamList = {
  FinancasMain: undefined;
  NovaMovimentacao: undefined;
  MovimentoDetalhe: { id: string };
};


export type RootTabParamList = {
  Home: undefined;
  FinancasStack: undefined;
  Tarefas: undefined;
  Refeicoes: undefined;
  Ideias: undefined;
  Tabs: undefined;
  NovaMovimentacao: undefined;
  MovimentoDetalhe: { id: string };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const FinancasStack = createNativeStackNavigator<FinancasStackParamList>();

// --------- STACK SÓ PARA A ABA FINANÇAS ---------
function FinancasStackNavigator() {
  return (
    <FinancasStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <FinancasStack.Screen
        name="FinancasMain"
        component={FinanceScreen}
      />
      <FinancasStack.Screen
        name="NovaMovimentacao"
        component={NovaMovimentacaoScreen}
      />
      <FinancasStack.Screen
        name="MovimentoDetalhe"
        component={DetalhesMovimentoScreen}
      />
    </FinancasStack.Navigator>
  );
}

// --------- APP ---------
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <MovimentosProvider>
            <Tab.Navigator
              screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#E5E7EB",
                tabBarInactiveTintColor: "#6B7280",
                tabBarStyle: {
                  backgroundColor: "#020617",
                  borderTopColor: "#111827",
                  borderTopWidth: 1,
                  height: 60,
                },
                tabBarLabelStyle: {
                  fontSize: 11,
                  fontWeight: "600",
                },
              }}
            >
              <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: "Início",
                  tabBarIcon: ({ color }) => (
                    <HomeIcon color={color} size={20} />
                  ),
                }}
              />

              <Tab.Screen
                name="FinancasStack"
                component={FinancasStackNavigator}
                options={{
                  title: "Finanças",
                  tabBarIcon: ({ color }) => (
                    <Wallet color={color} size={20} />
                  ),
                }}
              />

              <Tab.Screen
                name="Tarefas"
                component={TasksScreen}
                options={{
                  tabBarIcon: ({ color }) => (
                    <CheckSquare color={color} size={20} />
                  ),
                }}
              />

              <Tab.Screen
                name="Refeicoes"
                component={MealsScreen}
                options={{
                  title: "Refeições",
                  tabBarIcon: ({ color }) => (
                    <Utensils color={color} size={20} />
                  ),
                }}
              />

              <Tab.Screen
                name="Ideias"
                component={IdeasScreen}
                options={{
                  tabBarIcon: ({ color }) => (
                    <Lightbulb color={color} size={20} />
                  ),
                }}
              />
            </Tab.Navigator>
          </MovimentosProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
