import { StyleSheet, ActivityIndicator, Pressable, ScrollView, View, Text } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import React, { useEffect, useState, useCallback, useMemo } from 'react';

import {
  fetchDashboard,
  fetchTrackerTreatments,
  fetchTodayLogs,
  toggleTreatmentLog,
  TrackerTreatment,
  TreatmentLog,
} from '@/lib/api/dashboard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { TREATMENTS } from '@/lib/treatments';

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTodayMonth(): string {
  return getTodayDateString().slice(0, 7);
}

type Treatment = {
  id: number;
  treatmentType: string;
  timeOfDay: string;
  daysOfWeek: string[];
};

type DashboardData = {
  routines: Treatment[];
  todaysTreatments: Treatment[];
  motivationalMessage: string;
  progressTrackerInitialized: boolean;
};

const TREATMENT_LABELS: Record<string, string> = {
  minoxidil: 'Minoxidil 5%',
  finasteride: 'Finasteride 1mg',
  microneedling: 'Microneedling',
  ketoconazole: 'Ketoconazole Shampoo',
  hair_oils: 'Hair Oils',
};


export default function DashboardScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trackerTreatments, setTrackerTreatments] = useState<TrackerTreatment[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const today = getTodayDateString();
  const todayMonth = getTodayMonth();

  const themed = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    headerLabel: { color: dark ? '#9BA1A6' : '#999' },
    messageCard: { backgroundColor: dark ? '#2A2520' : '#FFF8E7' },
    messageText: { color: dark ? '#D4C4A0' : '#444' },
    routineCard: { backgroundColor: dark ? '#2A2520' : '#FFF8E7' },
    routineTitle: { color: dark ? '#ECEDEE' : '#333' },
    routineText: { color: dark ? '#D4C4A0' : '#444' },
    bullet: { color: dark ? '#ECEDEE' : '#333' },
    checkboxLabel: { color: dark ? '#ECEDEE' : '#333' },
    completionSummary: { color: dark ? '#9BA1A6' : '#999' },
    productName: { color: dark ? '#9BA1A6' : '#555' },
    progressCard: { backgroundColor: dark ? '#3A3420' : '#F5D76E' },
    progressTitle: { color: dark ? '#ECEDEE' : '#333' },
    progressSub: { color: dark ? '#9BA1A6' : '#555' },
    progressArrow: { color: dark ? '#ECEDEE' : '#333' },
  }), [dark, colors]);

  useEffect(() => {
    if (!user?.id) return;

    fetchDashboard(user.id)
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.error?.message ?? 'Failed to load dashboard');
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      fetchTrackerTreatments(user.id),
      fetchTodayLogs(user.id, todayMonth),
    ]).then(([treatments, logs]) => {
      setTrackerTreatments(treatments);
      const todayCompleted = new Set(
        logs
          .filter((l) => l.date === today && l.completed)
          .map((l) => l.treatmentId),
      );
      setCompletedIds(todayCompleted);
    });
  }, [user?.id, today, todayMonth]);

  const handleToggle = useCallback(async (treatmentId: string) => {
    if (!user?.id || togglingIds.has(treatmentId)) return;

    const wasCompleted = completedIds.has(treatmentId);
    const newCompleted = !wasCompleted;

    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (newCompleted) next.add(treatmentId);
      else next.delete(treatmentId);
      return next;
    });
    setTogglingIds((prev) => new Set(prev).add(treatmentId));

    try {
      const result = await toggleTreatmentLog(user.id, treatmentId, today, newCompleted);
      if (!result.success) {
        setCompletedIds((prev) => {
          const next = new Set(prev);
          if (wasCompleted) next.add(treatmentId);
          else next.delete(treatmentId);
          return next;
        });
      }
    } catch {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (wasCompleted) next.add(treatmentId);
        else next.delete(treatmentId);
        return next;
      });
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(treatmentId);
        return next;
      });
    }
  }, [user?.id, completedIds, togglingIds, today]);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={[styles.screen, themed.screen]} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={[styles.headerLabel, themed.headerLabel]}>Dashboard</Text>

      {/* Welcome */}
      <ThemedText type="title" style={styles.welcome}>
        Welcome back, {user?.firstName ?? 'there'}
      </ThemedText>

      {/* Motivational message */}
      {data?.motivationalMessage && (
        <View style={[styles.messageCard, themed.messageCard]}>
          <Text style={styles.messageEmoji}>👑</Text>
          <Text style={[styles.messageText, themed.messageText]}>{data.motivationalMessage}</Text>
        </View>
      )}

      {/* Today's Routine */}
      <View style={[styles.routineCard, themed.routineCard]}>
        <Text style={[styles.routineTitle, themed.routineTitle]}>Today's Routine</Text>
        {trackerTreatments.length > 0 ? (
          <>
            {trackerTreatments.map((t) => {
              const done = completedIds.has(t.id);
              const toggling = togglingIds.has(t.id);
              return (
                <Pressable
                  key={t.id}
                  style={styles.checkboxRow}
                  onPress={() => handleToggle(t.id)}
                  disabled={toggling}
                >
                  <View style={[styles.checkbox, done && styles.checkboxChecked]}>
                    {done && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.checkboxLabel, themed.checkboxLabel, done && styles.checkboxLabelDone]}>
                    {t.name}
                  </Text>
                </Pressable>
              );
            })}
            <Text style={[styles.completionSummary, themed.completionSummary]}>
              {completedIds.size} of {trackerTreatments.length} completed
            </Text>
          </>
        ) : data?.todaysTreatments && data.todaysTreatments.length > 0 ? (
          data.todaysTreatments.map((t) => (
            <View key={t.id} style={styles.routineItem}>
              <Text style={[styles.bullet, themed.bullet]}>{'\u2022'}</Text>
              <Text style={[styles.routineText, themed.routineText]}>
                {TREATMENT_LABELS[t.treatmentType] ?? t.treatmentType}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.routineText, themed.routineText]}>No treatments scheduled today.</Text>
        )}
      </View>

      {/* Explore Products */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Explore Treatments
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsRow}
      >
        {TREATMENTS.map((treatment) => (
          <Pressable
            key={treatment.id}
            style={styles.productCard}
            onPress={() => router.push(`/treatments/${treatment.id}` as any)}
          >
            <View style={[styles.productIcon, { backgroundColor: treatment.color }]}>
              <Text style={styles.productEmoji}>{treatment.emoji}</Text>
            </View>
            <Text style={[styles.productName, themed.productName]}>{treatment.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Progress Tracker */}
      {!data?.progressTrackerInitialized && (
        <Pressable
          style={[styles.progressCard, themed.progressCard]}
          onPress={() => router.push('/dashboard/progress')}
        >
          <View style={styles.progressContent}>
            <Text style={[styles.progressTitle, themed.progressTitle]}>Progress Tracker</Text>
            <Text style={[styles.progressSub, themed.progressSub]}>
              Click here to set up your progress tracker
            </Text>
          </View>
          <Text style={[styles.progressArrow, themed.progressArrow]}>↗</Text>
        </Pressable>
      )}

      {/* Dev Navigation Menu - only visible in development */}
      {__DEV__ && (
        <View style={styles.devMenu}>
          <Text style={styles.devTitle}>Dev Navigation</Text>
          <Link href="/onboarding" style={styles.devLink}>
            <Text style={styles.devLinkText}>→ Onboarding</Text>
          </Link>
          <Link href="/onboarding-complete" style={styles.devLink}>
            <Text style={styles.devLinkText}>→ Onboarding Complete</Text>
          </Link>
          <Link href="/sign-up" style={styles.devLink}>
            <Text style={styles.devLinkText}>→ Sign Up</Text>
          </Link>
          <Link href="/routine-tracker-setup" style={styles.devLink}>
            <Text style={styles.devLinkText}>→ Routine Tracker Setup</Text>
          </Link>
          <Link href="/dashboard/progress" style={styles.devLink}>
            <Text style={styles.devLinkText}>→ Progress Tracker</Text>
          </Link>
          <Pressable onPress={() => signOut()} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 32,
  },
  headerLabel: {
    fontSize: 13,
    marginBottom: 12,
  },
  welcome: {
    marginBottom: 20,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  messageEmoji: {
    fontSize: 28,
    marginTop: 2,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  routineCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 28,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  bullet: {
    fontSize: 18,
  },
  routineText: {
    fontSize: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 15,
    flex: 1,
  },
  checkboxLabelDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  completionSummary: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'right',
  },
  sectionTitle: {
    marginBottom: 14,
  },
  productsRow: {
    gap: 16,
    paddingBottom: 4,
    marginBottom: 24,
  },
  productCard: {
    alignItems: 'center',
    width: 90,
  },
  productIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productEmoji: {
    fontSize: 28,
  },
  productName: {
    fontSize: 12,
    textAlign: 'center',
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 18,
  },
  progressContent: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressSub: {
    fontSize: 13,
  },
  progressArrow: {
    fontSize: 24,
    marginLeft: 12,
  },
  devMenu: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  devTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#856404',
  },
  devLink: {
    paddingVertical: 8,
  },
  devLinkText: {
    color: '#856404',
    fontSize: 14,
  },
  signOutBtn: {
    marginTop: 15,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
