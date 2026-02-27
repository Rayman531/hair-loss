import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface JourneyHeaderProps {
  journeyDay: number;
  routineCreatedAt: string;
}

function formatStartDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function JourneyHeader({ journeyDay, routineCreatedAt }: JourneyHeaderProps) {
  const dark = useColorScheme() === 'dark';
  const textColor = dark ? '#ECEDEE' : '#1A1A1A';

  return (
    <View style={styles.container}>
      <Text style={[styles.dayNumber, { color: textColor }]}>Day {journeyDay}</Text>
      <Text style={[styles.title, { color: textColor }]}>of Your Hair Journey</Text>
      <Text style={styles.subtitle}>Started on {formatStartDate(routineCreatedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 28,
  },
  dayNumber: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: -2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
  },
});
