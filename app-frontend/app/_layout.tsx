import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';

import { tokenCache } from '@/lib/token-cache';
import { ThemeContextProvider, useThemeContext } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { useNotifications } from '@/hooks/useNotifications';
import React from 'react';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in environment variables');
}

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme];
  useNotifications();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="onboarding-complete" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="routine-tracker-setup" />
        <Stack.Screen name="tracker" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="account" />
        <Stack.Screen name="treatments" />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ThemeContextProvider>
          <RootNavigator />
        </ThemeContextProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
