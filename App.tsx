import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, CheckSquare, Utensils, Lightbulb, Home as HomeIcon } from 'lucide-react-native';
import Home from './src/screens/home';
import FinanceScreen from './src/screens/Finance';
import TasksScreen from './src/screens/tasks';
import MealsScreen from './src/screens/Meals';
import IdeasScreen from './src/screens/Ideas';
import Finance from './src/screens/Finance';   // põe os teus componentes
import Tasks from './src/screens/tasks';
import Meals from './src/screens/Meals';
import Ideas from './src/screens/Ideas';
import { colors } from './src/theme/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderTopColor: colors.border,
                borderTopWidth: 1,
                height: 60,
              },
              tabBarActiveTintColor: colors.text,
              tabBarInactiveTintColor: colors.sub,
              tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            }}
          >
            <Tab.Screen
              name="Início"
              component={Home}
              options={{ tabBarIcon: ({ color }) => <HomeIcon color={color} size={20} /> }}
            />
            <Tab.Screen
              name="Finanças"
              component={FinanceScreen}
              options={{ tabBarIcon: ({ color }) => <Wallet color={color} size={20} /> }}
            />
            <Tab.Screen
              name="Tarefas"
              component={TasksScreen}
              options={{ tabBarIcon: ({ color }) => <CheckSquare color={color} size={20} /> }}
            />
            <Tab.Screen
              name="Refeições"
              component={MealsScreen}
              options={{ tabBarIcon: ({ color }) => <Utensils color={color} size={20} /> }}
            />
            <Tab.Screen
              name="Ideias"
              component={IdeasScreen}
              options={{ tabBarIcon: ({ color }) => <Lightbulb color={color} size={20} /> }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
