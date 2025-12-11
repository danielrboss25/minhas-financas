// App.tsx
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

// ATENÇÃO AOS CAMINHOS / CASE DOS FICHEIROS
import HomeScreen from "./src/screens/home"; // home.tsx
import FinanceScreen from "./src/screens/Finance"; // Finance.tsx
import TasksScreen from "./src/screens/tasks"; // tasks.tsx
import MealsScreen from "./src/screens/Meals"; // Meals.tsx
import MealDetailScreen from "./src/screens/MealDetail"; // MealDetail.tsx
import IdeasScreen from "./src/screens/Ideas"; // Ideas.tsx
import IdeaDetailScreen from "./src/screens/IdeaDetail"; // IdeaDetail.tsx
import NovaMovimentacaoScreen from "./src/screens/NovaMovimentacao"; // NovaMovimentacao.tsx
import DetalhesMovimentoScreen from "./src/screens/DetalhesMovimento"; // DetalhesMovimento.tsx

import { MovimentosProvider } from "./src/context/MovimentosContext";

// Tipos (se quiseres usar mais tarde em props, mantém)
export type FinancasStackParamList = {
  FinancasMain: undefined;
  NovaMovimentacao: undefined;
  MovimentoDetalhe: { id: string };
};

export type MealsStackParamList = {
  MealsMain: undefined;
  RefeicaoDetalhe: { meal: any };
};

export type IdeasStackParamList = {
  IdeasMain: undefined;
  IdeaDetail: { idea: any };
};

export type RootTabParamList = {
  Home: undefined;
  Financas: undefined;
  Refeicoes: undefined;
  Tarefas: undefined;
  Ideias: undefined;
};

// Para calar o TypeScript chato com o 'id'
const Tab = createBottomTabNavigator() as any;
const FinancasStack = createNativeStackNavigator() as any;
const MealsStack = createNativeStackNavigator() as any;
const IdeasStack = createNativeStackNavigator() as any;

// -------- STACK FINANÇAS --------
function FinancasStackNavigator() {
  return (
    <FinancasStack.Navigator
      initialRouteName="FinancasMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#020617" },
      }}
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

// -------- STACK REFEIÇÕES --------
function MealsStackNavigator() {
  return (
    <MealsStack.Navigator
      initialRouteName="MealsMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#020617" },
      }}
    >
      <MealsStack.Screen name="MealsMain" component={MealsScreen} />
      <MealsStack.Screen name="RefeicaoDetalhe" component={MealDetailScreen} />
    </MealsStack.Navigator>
  );
}

// -------- STACK IDEIAS --------
function IdeasStackNavigator() {
  return (
    <IdeasStack.Navigator
      initialRouteName="IdeasMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#020617" },
      }}
    >
      <IdeasStack.Screen name="IdeasMain" component={IdeasScreen} />
      <IdeasStack.Screen name="IdeaDetail" component={IdeaDetailScreen} />
    </IdeasStack.Navigator>
  );
}

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

// -------- ROOT APP --------
export default function App() {
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync("#020617");
    NavigationBar.setButtonStyleAsync("light");
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#020617" }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={navTheme}>
          <MovimentosProvider>
            <Tab.Navigator
              initialRouteName="Home"
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
                name="Financas"
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
                component={MealsStackNavigator}
                options={{
                  title: "Refeições",
                  tabBarIcon: ({ color }) => (
                    <Utensils color={color} size={20} />
                  ),
                }}
              />

              <Tab.Screen
                name="Ideias"
                component={IdeasStackNavigator}
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
