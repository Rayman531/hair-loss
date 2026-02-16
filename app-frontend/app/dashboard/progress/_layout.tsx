import { Stack } from 'expo-router';
import React from 'react';

import { ProgressSessionProvider } from './_context';

export default function ProgressLayout() {
  return (
    <ProgressSessionProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Progress Tracker' }} />
        <Stack.Screen name="setup" options={{ title: 'Progress Tracker - Setup' }} />
        <Stack.Screen name="camera" options={{ title: 'Take Photo', headerShown: false }} />
        <Stack.Screen name="gallery" options={{ title: 'Progress Gallery' }} />
        <Stack.Screen name="compare" options={{ title: 'Compare Progress' }} />
      </Stack>
    </ProgressSessionProvider>
  );
}
