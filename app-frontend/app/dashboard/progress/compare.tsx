import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';

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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CompareScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [sessions, setSessions] = useState<ProgressSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Indices into the sessions array
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(1);
  const [picking, setPicking] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    fetchProgressSessions(user.id)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setSessions(res.data);
          // Default: newest (index 0) on right, oldest on left
          if (res.data.length >= 2) {
            setLeftIdx(res.data.length - 1);
            setRightIdx(0);
          }
        } else {
          setError('Failed to load sessions');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

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

  if (sessions.length < 2) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>You need at least 2 sessions to compare.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back to Gallery</Text>
        </Pressable>
      </View>
    );
  }

  const sessionLeft = sessions[leftIdx];
  const sessionRight = sessions[rightIdx];

  // Session picker overlay
  if (picking) {
    return (
      <View style={styles.container}>
        <Text style={styles.pickerTitle}>
          Select {picking === 'left' ? 'Before' : 'After'} session
        </Text>
        <ScrollView contentContainerStyle={styles.pickerList}>
          {sessions.map((s, idx) => {
            const disabled =
              (picking === 'left' && idx === rightIdx) ||
              (picking === 'right' && idx === leftIdx);
            const selected =
              (picking === 'left' && idx === leftIdx) ||
              (picking === 'right' && idx === rightIdx);

            return (
              <Pressable
                key={s.id}
                style={[
                  styles.pickerItem,
                  selected && styles.pickerItemSelected,
                  disabled && styles.pickerItemDisabled,
                ]}
                disabled={disabled}
                onPress={() => {
                  if (picking === 'left') setLeftIdx(idx);
                  else setRightIdx(idx);
                  setPicking(null);
                }}
              >
                <Text style={[styles.pickerItemText, disabled && { color: '#ccc' }]}>
                  {formatDate(s.createdAt)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable style={styles.backBtn} onPress={() => setPicking(null)}>
          <Text style={styles.backBtnText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Date selectors */}
      <View style={styles.dateRow}>
        <Pressable style={styles.dateChip} onPress={() => setPicking('left')}>
          <Text style={styles.dateChipLabel}>Before</Text>
          <Text style={styles.dateChipValue}>{formatDate(sessionLeft.createdAt)}</Text>
        </Pressable>
        <Text style={styles.vsText}>vs</Text>
        <Pressable style={styles.dateChip} onPress={() => setPicking('right')}>
          <Text style={styles.dateChipLabel}>After</Text>
          <Text style={styles.dateChipValue}>{formatDate(sessionRight.createdAt)}</Text>
        </Pressable>
      </View>

      {/* Side-by-side photos per angle */}
      {ANGLE_KEYS.map(({ key, label }) => (
        <View key={key} style={styles.angleRow}>
          <Text style={styles.angleLabel}>{label}</Text>
          <View style={styles.photoRow}>
            <Image source={{ uri: sessionLeft[key] }} style={styles.compareImage} />
            <Image source={{ uri: sessionRight[key] }} style={styles.compareImage} />
          </View>
        </View>
      ))}

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Back to Gallery</Text>
      </Pressable>
    </ScrollView>
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
    padding: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Date selector row
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dateChip: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateChipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginBottom: 2,
  },
  dateChipValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  vsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#bbb',
  },

  // Angle comparison rows
  angleRow: {
    marginBottom: 20,
  },
  angleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  compareImage: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },

  // Session picker
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    padding: 20,
    paddingBottom: 12,
  },
  pickerList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pickerItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerItemSelected: {
    backgroundColor: '#FFF8E7',
    borderColor: '#F5D76E',
  },
  pickerItemDisabled: {
    opacity: 0.4,
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },

  // Shared
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});
