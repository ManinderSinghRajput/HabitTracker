import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { theme } from './theme';
import { TodayScreen } from './screens/TodayScreen';
import { HabitsScreen } from './screens/HabitsScreen';
import { TasksScreen } from './screens/TasksScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { TimerScreen } from './screens/TimerScreen';
import { AddHabitScreen } from './screens/AddHabitScreen';
import { AddTaskScreen } from './screens/AddTaskScreen';
import { HabitDetailScreen } from './screens/HabitDetailScreen';
import { ExpensesScreen } from './screens/ExpensesScreen';
import { AddExpenseScreen } from './screens/AddExpenseScreen';
import { NotesScreen } from './screens/NotesScreen';
import { AddNoteScreen } from './screens/AddNoteScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { NewCategoryScreen } from './screens/NewCategoryScreen';
import { AppDrawerLayout } from './drawer';

export type RootStackParamList = {
  Drawer: undefined;
  AddHabit: { habitId?: string } | undefined;
  AddTask: { taskId?: string } | undefined;
  HabitDetail: { habitId: string };
  Categories: undefined;
  Timer: undefined;
  Expenses: undefined;
  AddExpense: { expenseId?: string } | undefined;
  Notes: undefined;
  AddNote: { noteId?: string } | undefined;
  Settings: undefined;
  NewCategory: { categoryId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const WebStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: theme.bg,
    card: theme.bg,
    text: theme.text,
    border: theme.border,
    primary: theme.primary,
    notification: theme.primary,
  },
};

const Tabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.surface,
        borderTopColor: theme.border,
        height: 64,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: theme.textDim,
      tabBarIcon: ({ color, size, focused }) => {
        let icon: string = 'clipboard-list-outline';
        if (route.name === 'Today') icon = focused ? 'clipboard-check' : 'clipboard-list-outline';
        if (route.name === 'Habits') icon = focused ? 'medal' : 'medal-outline';
        if (route.name === 'Tasks') icon = focused ? 'check-circle' : 'check-circle-outline';
        if (route.name === 'Categories') icon = 'view-grid-outline';
        if (route.name === 'Timer') icon = 'timer-outline';
        return (
          <MaterialCommunityIcons name={icon as any} color={color} size={size} />
        );
      },
    })}
  >
    <Tab.Screen name="Today" component={TodayScreen} />
    <Tab.Screen name="Habits" component={HabitsScreen} />
    <Tab.Screen name="Tasks" component={TasksScreen} />
    <Tab.Screen name="Categories" component={CategoriesScreen} />
    <Tab.Screen name="Timer" component={TimerScreen} />
  </Tab.Navigator>
);

const DrawerRoot = () => (
  <AppDrawerLayout>
    <Tabs />
  </AppDrawerLayout>
);

const NativeRootStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: theme.bg },
    }}
  >
    <Stack.Screen name="Drawer" component={DrawerRoot} />
    <Stack.Screen name="AddHabit" component={AddHabitScreen} />
    <Stack.Screen name="AddTask" component={AddTaskScreen} />
    <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
    <Stack.Screen name="Categories" component={CategoriesScreen} />
    <Stack.Screen name="Timer" component={TimerScreen} />
    <Stack.Screen name="Expenses" component={ExpensesScreen} />
    <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    <Stack.Screen name="Notes" component={NotesScreen} />
    <Stack.Screen name="AddNote" component={AddNoteScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="NewCategory" component={NewCategoryScreen} />
  </Stack.Navigator>
);

const WebRootStack = () => (
  <WebStack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: theme.bg },
    }}
  >
    <WebStack.Screen name="Drawer" component={DrawerRoot} />
    <WebStack.Screen name="AddHabit" component={AddHabitScreen} />
    <WebStack.Screen name="AddTask" component={AddTaskScreen} />
    <WebStack.Screen name="HabitDetail" component={HabitDetailScreen} />
    <WebStack.Screen name="Categories" component={CategoriesScreen} />
    <WebStack.Screen name="Timer" component={TimerScreen} />
    <WebStack.Screen name="Expenses" component={ExpensesScreen} />
    <WebStack.Screen name="AddExpense" component={AddExpenseScreen} />
    <WebStack.Screen name="Notes" component={NotesScreen} />
    <WebStack.Screen name="AddNote" component={AddNoteScreen} />
    <WebStack.Screen name="Settings" component={SettingsScreen} />
    <WebStack.Screen name="NewCategory" component={NewCategoryScreen} />
  </WebStack.Navigator>
);

export const RootNavigator = () => (
  <NavigationContainer theme={navTheme}>
    {Platform.OS === 'web' ? <WebRootStack /> : <NativeRootStack />}
  </NavigationContainer>
);
