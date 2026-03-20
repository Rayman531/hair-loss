import { StyleSheet, ActivityIndicator, Pressable, ScrollView, View, Text, SafeAreaView } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

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
import { Colors, Shadows } from '@/constants/theme';
import { TREATMENTS } from '@/lib/treatments';
import { CrownMascot } from '@/components/CrownMascot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function getTodayWeekday(): string {
  return WEEKDAY_NAMES[new Date().getDay()];
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
  dutasteride: 'Dutasteride 0.5mg',
  microneedling: 'Microneedling',
  ketoconazole: 'Ketoconazole Shampoo',
  pumpkin_seed_oil: 'Pumpkin Seed Oil',
  rosemary_oil: 'Rosemary Oil',
  scalp_massage: 'Scalp Massage',
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

  const insets = useSafeAreaInsets();

  const [trackerTreatments, setTrackerTreatments] = useState<TrackerTreatment[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const today = getTodayDateString();
  const todayMonth = getTodayMonth();
  const todayWeekday = getTodayWeekday();

  // Floating animation for crown logo
  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, // infinite
      true,
    );
  }, [floatY]);
  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const shadows = Shadows[colorScheme ?? 'light'];
  const themed = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    headerLabel: { color: colors.textTertiary },
    messageCard: { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, ...shadows.card },
    messageText: { color: colors.textSecondary },
    routineTitle: { color: colors.text },
    routineText: { color: colors.textSecondary },
    treatmentCard: { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, ...shadows.card },
    checkboxLabel: { color: colors.text },
    completionSummary: { color: colors.textTertiary },
    productName: { color: colors.textSecondary },
    progressCard: { backgroundColor: colors.accentSurface, ...shadows.card },
    progressTitle: { color: colors.text },
    progressSub: { color: colors.textSecondary },
    progressArrow: { color: colors.text },
  }), [dark, colors, shadows]);

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

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;

      Promise.all([
        fetchTrackerTreatments(user.id, todayWeekday),
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
    }, [user?.id, today, todayMonth, todayWeekday])
  );

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
    <ScrollView style={[styles.screen, themed.screen]} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      {/* Header */}
      <Text style={[styles.headerLabel, themed.headerLabel]}>Dashboard</Text>

      {/* Welcome */}
      <ThemedText type="title" style={styles.welcome}>
        Welcome back, {user?.firstName ?? 'there'}
      </ThemedText>

      {/* Motivational message */}
      {data?.motivationalMessage && (
        <View style={[styles.messageCard, themed.messageCard]}>
          <Animated.View style={floatingStyle}>
            <CrownMascot state="neutral" size={48} />
          </Animated.View>
          <Text style={[styles.messageText, themed.messageText]}>{data.motivationalMessage}</Text>
        </View>
      )}

      {/* Today's Routine */}
      <Text style={[styles.routineTitle, themed.routineTitle]}>Today's Routine</Text>
      {trackerTreatments.length > 0 ? (
        <View style={styles.routineList}>
          {trackerTreatments.map((t) => {
            const done = completedIds.has(t.id);
            const toggling = togglingIds.has(t.id);
            return (
              <Pressable
                key={t.id}
                style={[styles.treatmentCard, themed.treatmentCard]}
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
        </View>
      ) : data?.todaysTreatments && data.todaysTreatments.length > 0 ? (
        <View style={styles.routineList}>
          {data.todaysTreatments.map((t) => (
            <View key={t.id} style={[styles.treatmentCard, themed.treatmentCard]}>
              <Text style={[styles.checkboxLabel, themed.checkboxLabel]}>
                {TREATMENT_LABELS[t.treatmentType] ?? t.treatmentType}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyRoutineCard, themed.treatmentCard]}>
          <Text style={[styles.routineText, themed.routineText]}>No treatments scheduled for today.</Text>
          <Text style={[styles.routineSubtext, themed.routineText]}>
            Head to the routine tracker to add treatments to your routine.
          </Text>
        </View>
      )}

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
              {treatment.icon ? (
                <treatment.icon size={treatment.iconSize ?? 36} />
              ) : (
                <Text style={styles.productEmoji}>{treatment.emoji}</Text>
              )}
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
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  messageLogo: {
    marginTop: 2,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  routineList: {
    gap: 10,
    marginBottom: 28,
  },
  treatmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyRoutineCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  routineText: {
    fontSize: 14,
    textAlign: 'left',
  },
  routineSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'left',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#C8C8C8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  checkboxChecked: {
    backgroundColor: '#3BAF5C',
    borderColor: '#3BAF5C',
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
    color: '#8E8E93',
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
    backgroundColor: '#FFF9EC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5B94E',
  },
  devTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#7A6520',
  },
  devLink: {
    paddingVertical: 8,
  },
  devLinkText: {
    color: '#7A6520',
    fontSize: 14,
  },
  signOutBtn: {
    marginTop: 15,
    backgroundColor: '#D44332',
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
