import { Stack } from 'expo-router';
import React from 'react';

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy', headerShown: true }} />
    </Stack>
  );
}
