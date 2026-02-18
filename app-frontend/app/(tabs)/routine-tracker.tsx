import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { API_ENDPOINTS } from '../../constants/api';
import JourneyHeader from '../../components/tracker/JourneyHeader';
import WeeklyConsistency from '../../components/tracker/WeeklyConsistency';
import AdherenceCalendar from '../../components/tracker/AdherenceCalendar';
import CTASection from '../../components/tracker/CTASection';

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

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = useMemo(() => getCurrentMonth(), []);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const headers = { 'X-User-Id': userId };

    try {
      // Fetch summary and heatmap in parallel
      const [summaryRes, heatmapRes] = await Promise.all([
        fetch(API_ENDPOINTS.TRACKER_SUMMARY, { headers }).then((r) => r.json()),
        fetch(`${API_ENDPOINTS.TRACKER_HEATMAP}?month=${currentMonth}`, { headers })
          .then((r) => r.json())
          .catch(() => null), // Don't block page if heatmap fails
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A1A1A" />
        </View>
      </SafeAreaView>
    );
  }

  // Error / no routine state
  if (error || !summary) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No Routine Yet</Text>
          <Text style={styles.emptySubtext}>
            {error || 'Set up your routine to start tracking your hair journey.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
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

        <CTASection
          onPress={() => router.push('/tracker/side-effects' as any)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
