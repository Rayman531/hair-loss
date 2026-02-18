import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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

function getBarColor(percentage: number): string {
  if (percentage >= 100) return '#34C759';
  if (percentage >= 60) return '#1A1A1A';
  if (percentage > 0) return '#A89B8C';
  return '#E0E0E0';
}

function getBarBgColor(percentage: number): string {
  if (percentage >= 100) return '#E8F8ED';
  return '#F0F0F0';
}

export default function WeeklyConsistency({ treatments }: WeeklyConsistencyProps) {
  if (treatments.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week's Consistency</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No treatments configured yet.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>This Week's Consistency</Text>
      {treatments.map((t) => {
        const barColor = getBarColor(t.percentage);
        const barBg = getBarBgColor(t.percentage);
        const widthPercent = Math.min(t.percentage, 100);

        return (
          <View
            key={t.treatment_id}
            style={[styles.card, t.percentage >= 100 && styles.cardSuccess]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.treatmentName}>{t.name}</Text>
              <Text style={[styles.percentage, t.percentage >= 100 && styles.percentageSuccess]}>
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

            <Text style={styles.daysText}>
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
    color: '#1A1A1A',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardSuccess: {
    borderColor: '#D4EDDA',
    backgroundColor: '#FCFEFB',
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
    color: '#1A1A1A',
  },
  percentage: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  percentageSuccess: {
    color: '#34C759',
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
    color: '#999999',
  },
  emptyCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
  },
});
