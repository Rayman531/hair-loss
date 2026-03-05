import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Shadows } from '@/constants/theme';

interface TreatmentConsistency {
  treatment_id: string;
  name: string;
  completed_days: number;
  expected_days: number;
  percentage: number;
}

interface WeeklyConsistencyProps {
  treatments: TreatmentConsistency[];
}

export default function WeeklyConsistency({ treatments }: WeeklyConsistencyProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const shadows = Shadows[colorScheme ?? 'light'];

  const getBarColor = (percentage: number): string => {
    if (percentage >= 100) return colors.success;
    if (percentage >= 60) return colors.progressBarFill;
    if (percentage > 0) return colors.accentSoft;
    return colors.border;
  };

  const getBarBgColor = (percentage: number): string => {
    if (percentage >= 100) return colors.successBackground;
    return colors.progressBarTrack;
  };

  if (treatments.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week's Consistency</Text>
        <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No treatments configured yet.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week's Consistency</Text>
      {treatments.map((t) => {
        const barColor = getBarColor(t.percentage);
        const barBg = getBarBgColor(t.percentage);
        const widthPercent = Math.min(t.percentage, 100);

        return (
          <View
            key={t.treatment_id}
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBackground,
                borderColor: t.percentage >= 100 ? colors.successBorder : colors.cardBorder,
              },
              shadows.card,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.treatmentName, { color: colors.text }]}>{t.name}</Text>
              <Text style={[
                styles.percentage,
                { color: t.percentage >= 100 ? colors.success : colors.text },
              ]}>
                {t.percentage}%
              </Text>
            </View>

            <View style={[styles.barTrack, { backgroundColor: barBg }]}>
              {widthPercent > 0 && (
                <View
                  style={[
                    styles.barFill,
                    { width: `${widthPercent}%`, backgroundColor: barColor },
                  ]}
                />
              )}
            </View>

            <Text style={[styles.daysText, { color: colors.textTertiary }]}>
              {t.completed_days} of {t.expected_days} days completed
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 20,
    fontWeight: '800',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  daysText: {
    fontSize: 13,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
