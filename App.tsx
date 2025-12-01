import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";

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
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const FinancasStack = createNativeStackNavigator<FinancasStackParamList>();

// --------- STACK SÓ PARA A ABA FINANÇAS ---------
function FinancasStackNavigator() {
  return (
    <FinancasStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#020617" }, // fundo escuro dentro do stack
      }}
      id={undefined} // satisfaz o tipo manhoso do navigator
    >
      <FinancasStack.Screen name="FinancasMain" component={FinanceScreen} />
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

// --------- TEMA ESCURO PARA O NAVIGATIONCONTAINER ---------
const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#020617", // fundo da app inteira
    card: "#020617", // fundo das “cards” de navegação (tabs, headers, etc.)
    border: "#111827",
    primary: "#38BDF8",
    text: "#F9FAFB",
  },
};

// --------- APP ---------
export default function App() {
  useEffect(() => {
    // cor da barra de navegação (a tal barra branca)
    NavigationBar.setBackgroundColorAsync("#020617");
    // ícones claros
    NavigationBar.setButtonStyleAsync("light");
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#020617" }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={navTheme}>
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
              id={undefined} // idem: cala o TS e em runtime é irrelevante
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
                  tabBarIcon: ({ color }) => <Wallet color={color} size={20} />,
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
