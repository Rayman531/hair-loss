import { StyleSheet, ActivityIndicator, Pressable, ScrollView, View, Text } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { fetchDashboard } from '@/lib/api/dashboard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

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

const PRODUCTS = [
  { id: 'rosemary-oil', name: 'Rosemary Oil', emoji: '🌿', color: '#E8F5E9' },
  { id: 'finasteride', name: 'Finasteride', emoji: '💊', color: '#FFF3E0' },
  { id: 'microneedling', name: 'Microneedling', emoji: '🪡', color: '#F3E5F5' },
  { id: 'ketoconazole', name: 'Ketoconazole', emoji: '🧴', color: '#E3F2FD' },
  { id: 'biotin', name: 'Biotin', emoji: '💛', color: '#FFFDE7' },
];

export default function DashboardScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.headerLabel}>Dashboard</Text>

      {/* Welcome */}
      <ThemedText type="title" style={styles.welcome}>
        Welcome back, {user?.firstName ?? 'there'}
      </ThemedText>

      {/* Motivational message */}
      {data?.motivationalMessage && (
        <View style={styles.messageCard}>
          <Text style={styles.messageEmoji}>👑</Text>
          <Text style={styles.messageText}>{data.motivationalMessage}</Text>
        </View>
      )}

      {/* Today's Routine */}
      <View style={styles.routineCard}>
        <Text style={styles.routineTitle}>Today's Routine:</Text>
        {data?.todaysTreatments && data.todaysTreatments.length > 0 ? (
          data.todaysTreatments.map((t) => (
            <View key={t.id} style={styles.routineItem}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.routineText}>
                {TREATMENT_LABELS[t.treatmentType] ?? t.treatmentType}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.routineText}>No treatments scheduled today.</Text>
        )}
      </View>

      {/* Explore Products */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Explore Products
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsRow}
      >
        {PRODUCTS.map((product) => (
          <Pressable key={product.id} style={styles.productCard}>
            <View style={[styles.productIcon, { backgroundColor: product.color }]}>
              <Text style={styles.productEmoji}>{product.emoji}</Text>
            </View>
            <Text style={styles.productName}>{product.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Progress Tracker */}
      {!data?.progressTrackerInitialized && (
        <Pressable
          style={styles.progressCard}
          onPress={() => router.push('/dashboard/progress')}
        >
          <View style={styles.progressContent}>
            <Text style={styles.progressTitle}>Progress Tracker</Text>
            <Text style={styles.progressSub}>
              Click here to set up your progress tracker
            </Text>
          </View>
          <Text style={styles.progressArrow}>↗</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
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

  // Header
  headerLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },

  // Welcome
  welcome: {
    marginBottom: 20,
  },

  // Motivational message card
  messageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF8E7',
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
    color: '#444',
  },

  // Today's Routine card
  routineCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF8E7',
    marginBottom: 28,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    color: '#333',
  },
  routineText: {
    fontSize: 15,
    color: '#444',
  },

  // Explore Products
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
    color: '#555',
    textAlign: 'center',
  },

  // Progress Tracker card
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#F5D76E',
  },
  progressContent: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  progressSub: {
    fontSize: 13,
    color: '#555',
  },
  progressArrow: {
    fontSize: 24,
    color: '#333',
    marginLeft: 12,
  },
});
