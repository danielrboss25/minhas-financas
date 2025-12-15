// src/navigation/AppNavigator.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Wallet,
  CheckSquare,
  Utensils,
  Lightbulb,
  Home as HomeIcon,
  User as UserIcon,
} from "lucide-react-native";

import HomeScreen from "../screens/home";
import FinanceScreen from "../screens/Finance";
import TasksScreen from "../screens/tasks";
import MealsScreen from "../screens/Meals";
import MealDetailScreen from "../screens/MealDetail";
import IdeasScreen from "../screens/Ideas";
import IdeaDetailScreen from "../screens/IdeaDetail";
import NovaMovimentacaoScreen from "../screens/NovaMovimentacao";
import DetalhesMovimentoScreen from "../screens/DetalhesMovimento";
import ProfileScreen from "../screens/Profile";

import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator() as any;
const FinancasStack = createNativeStackNavigator() as any;
const MealsStack = createNativeStackNavigator() as any;
const IdeasStack = createNativeStackNavigator() as any;

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

function TopBar() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const label = useMemo(() => {
    const name = user?.displayName?.trim();
    if (name) return name;
    const email = user?.email?.trim();
    if (email) return email;
    return "Sessão ativa";
  }, [user]);

  // Altura “visual” do header (sem contar com a status bar)
  const BAR_HEIGHT = 46;

  return (
    <View
      style={[
        styles.topBar,
        {
          paddingTop: insets.top,            // <- respeita notch/status bar
          height: BAR_HEIGHT + insets.top,   // <- aumenta a altura total
        },
      ]}
    >
      <View style={styles.topBarDot} />
      <Text style={styles.topBarText} numberOfLines={1}>
        Autenticado: {label}
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: "#020617" }}>
      <TopBar />

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
            tabBarIcon: ({ color }: any) => <HomeIcon color={color} size={20} />,
          }}
        />

        <Tab.Screen
          name="Financas"
          component={FinancasStackNavigator}
          options={{
            title: "Finanças",
            tabBarIcon: ({ color }: any) => <Wallet color={color} size={20} />,
          }}
        />

        <Tab.Screen
          name="Tarefas"
          component={TasksScreen}
          options={{
            title: "Tarefas",
            tabBarIcon: ({ color }: any) => (
              <CheckSquare color={color} size={20} />
            ),
          }}
        />

        <Tab.Screen
          name="Refeicoes"
          component={MealsStackNavigator}
          options={{
            title: "Refeições",
            tabBarIcon: ({ color }: any) => <Utensils color={color} size={20} />,
          }}
        />

        <Tab.Screen
          name="Ideias"
          component={IdeasStackNavigator}
          options={{
            title: "Ideias",
            tabBarIcon: ({ color }: any) => <Lightbulb color={color} size={20} />,
          }}
        />

        <Tab.Screen
          name="Perfil"
          component={ProfileScreen}
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }: any) => <UserIcon color={color} size={20} />,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
    backgroundColor: "#020617",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  topBarDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#22C55E",
  },
  topBarText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "700",
  },
});
