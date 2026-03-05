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
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  const currentMonth = useMemo(() => getCurrentMonth(), []);
  const [displayMonth, setDisplayMonth] = useState(currentMonth);

  const themed = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    emptyTitle: { color: colors.text },
    editButton: {
      backgroundColor: colors.background,
      borderColor: colors.accent,
    },
    editButtonText: { color: colors.accent },
  }), [dark, colors]);

  const fetchHeatmap = useCallback(async (month: string) => {
    if (!userId) return;
    setHeatmapLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.TRACKER_HEATMAP}?month=${month}`, {
        headers: { 'X-User-Id': userId },
      }).then((r) => r.json());
      if (res?.success && res.data) {
        setHeatmap(res.data);
      }
    } catch {
      // keep existing heatmap on error
    } finally {
      setHeatmapLoading(false);
    }
  }, [userId]);

  const shiftMonth = useCallback((month: string, delta: number): string => {
    const [y, m] = month.split('-').map(Number);
    const date = new Date(y, m - 1 + delta, 1);
    const ny = date.getFullYear();
    const nm = String(date.getMonth() + 1).padStart(2, '0');
    return `${ny}-${nm}`;
  }, []);

  const handlePrevMonth = useCallback(() => {
    const prev = shiftMonth(displayMonth, -1);
    setDisplayMonth(prev);
    fetchHeatmap(prev);
  }, [displayMonth, shiftMonth, fetchHeatmap]);

  const handleNextMonth = useCallback(() => {
    if (displayMonth >= currentMonth) return;
    const next = shiftMonth(displayMonth, 1);
    setDisplayMonth(next);
    fetchHeatmap(next);
  }, [displayMonth, currentMonth, shiftMonth, fetchHeatmap]);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const headers = { 'X-User-Id': userId };

    try {
      const [summaryRes, heatmapRes] = await Promise.all([
        fetch(API_ENDPOINTS.TRACKER_SUMMARY, { headers }).then((r) => r.json()),
        fetch(`${API_ENDPOINTS.TRACKER_HEATMAP}?month=${displayMonth}`, { headers })
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
  }, [userId, displayMonth]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, themed.screen]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
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
          <AdherenceCalendar
            month={heatmap.month}
            days={heatmap.days}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            canGoNext={displayMonth < currentMonth}
          />
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
    color: '#8E8E93',
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
    color: '#8E8E93',
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
