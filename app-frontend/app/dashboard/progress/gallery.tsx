import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import React, { useCallback, useEffect, useState, useMemo } from 'react';

import { fetchProgressSessions, deleteProgressSession, ProgressSession, Angle } from '@/lib/api/progress';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];

  const [sessions, setSessions] = useState<ProgressSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const themed = useMemo(() => ({
    container: { backgroundColor: colors.background },
    heading: { color: dark ? '#ECEDEE' : '#333' },
    compareChip: { backgroundColor: dark ? '#2A2A2A' : '#f0f0f0' },
    compareChipText: { color: dark ? '#9BA1A6' : '#555' },
    cameraIconText: { color: dark ? '#1A1A1A' : '#333' },
    sessionCard: {
      backgroundColor: dark ? '#1E2022' : '#fafafa',
      borderColor: dark ? '#333' : '#eee',
    },
    sessionDate: { color: dark ? '#ECEDEE' : '#333' },
    deleteButton: { backgroundColor: dark ? '#3A2020' : '#fdeaea' },
    thumbImage: { backgroundColor: dark ? '#333' : '#e0e0e0' },
  }), [dark, colors]);

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

  const performDelete = useCallback(
    async (session: ProgressSession) => {
      if (!user?.id) return;
      setDeletingId(session.id);
      try {
        await deleteProgressSession(user.id, session.id);
        setSessions((prev) => prev.filter((s) => s.id !== session.id));
      } catch (err: any) {
        const msg = err.message ?? 'Failed to delete session';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Error', msg);
        }
      } finally {
        setDeletingId(null);
      }
    },
    [user?.id],
  );

  const handleDelete = useCallback(
    (session: ProgressSession) => {
      const message = `Are you sure you want to delete the photos from ${formatDate(session.createdAt)}? This cannot be undone.`;

      if (Platform.OS === 'web') {
        if (window.confirm(message)) {
          performDelete(session);
        }
      } else {
        Alert.alert('Delete Photo Set', message, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => performDelete(session),
          },
        ]);
      }
    },
    [performDelete],
  );

  useEffect(load, [load]);

  if (loading) {
    return (
      <View style={[styles.centered, themed.container]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, themed.container]}>
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, themed.container]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.heading, themed.heading]}>Your Progress</Text>
        <View style={styles.headerActions}>
          {sessions.length >= 2 && (
            <Pressable
              style={[styles.compareChip, themed.compareChip]}
              onPress={() => router.push('/dashboard/progress/compare')}
            >
              <Text style={[styles.compareChipText, themed.compareChipText]}>Compare</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.cameraIcon}
            onPress={() => router.push('/dashboard/progress/setup')}
          >
            <Text style={[styles.cameraIconText, themed.cameraIconText]}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Sessions list */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>No progress photos yet.</Text>
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={[styles.sessionCard, themed.sessionCard]}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionHeaderRow}>
                  <Text style={[styles.sessionDate, themed.sessionDate]}>{formatDate(session.createdAt)}</Text>
                  <Pressable
                    style={[styles.deleteButton, themed.deleteButton]}
                    onPress={() => handleDelete(session)}
                    disabled={deletingId === session.id}
                  >
                    {deletingId === session.id ? (
                      <ActivityIndicator size="small" color="#e74c3c" />
                    ) : (
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    )}
                  </Pressable>
                </View>
                {session.note && (
                  <Text style={styles.sessionNote}>{session.note}</Text>
                )}
              </View>

              <View style={styles.thumbGrid}>
                {ANGLE_KEYS.map(({ key, label }) => (
                  <View key={key} style={styles.thumbCell}>
                    <Image
                      source={{ uri: session[key] }}
                      style={[styles.thumbImage, themed.thumbImage]}
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
  },
  compareChipText: {
    fontSize: 13,
    fontWeight: '600',
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
    borderWidth: 1,
    overflow: 'hidden',
  },
  sessionHeader: {
    padding: 14,
    paddingBottom: 10,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e74c3c',
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '700',
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
