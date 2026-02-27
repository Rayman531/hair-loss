import { Stack } from 'expo-router';
import React from 'react';

export default function TreatmentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
