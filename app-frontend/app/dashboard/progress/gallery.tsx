import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import React, { useCallback, useEffect, useState } from 'react';

import { fetchProgressSessions, ProgressSession, Angle } from '@/lib/api/progress';
import { ThemedText } from '@/components/themed-text';

const ANGLE_KEYS: { key: `${Angle}ImageUrl`; label: string }[] = [
  { key: 'frontImageUrl', label: 'Front' },
  { key: 'topImageUrl', label: 'Top' },
  { key: 'rightImageUrl', label: 'Right' },
  { key: 'leftImageUrl', label: 'Left' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function GalleryScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [sessions, setSessions] = useState<ProgressSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchProgressSessions(user.id)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setSessions(res.data);
        } else {
          setError('Failed to load sessions');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(load, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Your Progress</Text>
        <View style={styles.headerActions}>
          {sessions.length >= 2 && (
            <Pressable
              style={styles.compareChip}
              onPress={() => router.push('/dashboard/progress/compare')}
            >
              <Text style={styles.compareChipText}>Compare</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.cameraIcon}
            onPress={() => router.push('/dashboard/progress/setup')}
          >
            <Text style={styles.cameraIconText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Sessions list */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>No progress photos yet.</Text>
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionDate}>{formatDate(session.createdAt)}</Text>
                {session.note && (
                  <Text style={styles.sessionNote}>{session.note}</Text>
                )}
              </View>

              <View style={styles.thumbGrid}>
                {ANGLE_KEYS.map(({ key, label }) => (
                  <View key={key} style={styles.thumbCell}>
                    <Image
                      source={{ uri: session[key] }}
                      style={styles.thumbImage}
                    />
                    <Text style={styles.thumbLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compareChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  compareChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  cameraIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5D76E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: -1,
  },

  // Scroll
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    gap: 20,
    paddingBottom: 40,
  },

  // Session card
  sessionCard: {
    borderRadius: 14,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  sessionHeader: {
    padding: 14,
    paddingBottom: 10,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  sessionNote: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },

  // Thumbnail grid (2×2)
  thumbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumbCell: {
    width: '50%',
    aspectRatio: 1,
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  thumbLabel: {
    position: 'absolute',
    bottom: 4,
    left: 6,
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },

  // Empty
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 60,
  },
});
