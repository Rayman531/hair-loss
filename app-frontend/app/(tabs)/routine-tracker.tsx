import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS } from '../../constants/api';
import JourneyHeader from '../../components/tracker/JourneyHeader';
import WeeklyConsistency from '../../components/tracker/WeeklyConsistency';
import AdherenceCalendar from '../../components/tracker/AdherenceCalendar';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface TreatmentConsistency {
  treatment_id: string;
  name: string;
  completed_days: number;
  expected_days: number;
  percentage: number;
}

interface SummaryData {
  journey_day: number;
  routine_created_at: string;
  weekly_consistency: TreatmentConsistency[];
}

interface HeatmapDay {
  date: string;
  completion_ratio: number;
}

interface HeatmapData {
  month: string;
  days: HeatmapDay[];
}

function getCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function RoutineTrackerScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = useMemo(() => getCurrentMonth(), []);

  const themed = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    emptyTitle: { color: dark ? '#ECEDEE' : '#1A1A1A' },
    editButton: {
      backgroundColor: colors.background,
      borderColor: dark ? '#ECEDEE' : '#1A1A1A',
    },
    editButtonText: { color: dark ? '#ECEDEE' : '#1A1A1A' },
  }), [dark, colors]);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const headers = { 'X-User-Id': userId };

    try {
      const [summaryRes, heatmapRes] = await Promise.all([
        fetch(API_ENDPOINTS.TRACKER_SUMMARY, { headers }).then((r) => r.json()),
        fetch(`${API_ENDPOINTS.TRACKER_HEATMAP}?month=${currentMonth}`, { headers })
          .then((r) => r.json())
          .catch(() => null),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      } else {
        setError('No routine found. Complete your routine setup first.');
      }

      if (heatmapRes?.success && heatmapRes.data) {
        setHeatmap(heatmapRes.data);
      }
    } catch {
      setError('Unable to load your routine data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, currentMonth]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, themed.screen]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={dark ? '#ECEDEE' : '#1A1A1A'} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !summary) {
    return (
      <SafeAreaView style={[styles.screen, themed.screen]}>
        <View style={styles.centered}>
          <Text style={[styles.emptyTitle, themed.emptyTitle]}>No Routine Yet</Text>
          <Text style={styles.emptySubtext}>
            {error || 'Set up your routine to start tracking your hair journey.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, themed.screen]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerLabel}>Routine Tracker</Text>

        <JourneyHeader
          journeyDay={summary.journey_day}
          routineCreatedAt={summary.routine_created_at}
        />

        <WeeklyConsistency treatments={summary.weekly_consistency} />

        {heatmap && (
          <AdherenceCalendar month={heatmap.month} days={heatmap.days} />
        )}

        <TouchableOpacity
          style={[styles.editButton, themed.editButton]}
          onPress={() => router.push('/tracker/edit' as any)}
          activeOpacity={0.8}
        >
          <Text style={[styles.editButtonText, themed.editButtonText]}>Edit Routine</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  headerLabel: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  editButton: {
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderWidth: 2,
    marginTop: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
