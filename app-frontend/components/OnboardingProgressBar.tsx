import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

interface OnboardingProgressBarProps {
  current: number;
  total: number;
}

export function OnboardingProgressBar({ current, total }: OnboardingProgressBarProps) {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme];
  const progress = Math.min(current / total, 1);

  return (
    <View style={[styles.track, { backgroundColor: colors.progressBarTrack }]}>
      <View
        style={[
          styles.fill,
          { backgroundColor: colors.accent, width: `${progress * 100}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    borderRadius: 1.5,
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
