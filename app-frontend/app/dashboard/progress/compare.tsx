import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import React, { useEffect, useState, useMemo } from 'react';

import { fetchProgressSessions, ProgressSession, Angle } from '@/lib/api/progress';
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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CompareScreen() {
  const { user } = useUser();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const themed = useMemo(() => ({
    container: { backgroundColor: colors.background },
    dateChip: { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
    dateChipLabel: { color: colors.textTertiary },
    dateChipValue: { color: colors.text },
    vsText: { color: colors.textTertiary },
    angleLabel: { color: colors.textSecondary },
    imagePlaceholder: { backgroundColor: colors.backgroundTertiary },
    pickerTitle: { color: colors.text },
    pickerItem: { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
    pickerItemSelected: { backgroundColor: colors.accentBackground, borderColor: colors.accent },
    pickerItemText: { color: colors.text },
    emptyText: { color: colors.textTertiary },
    backBtn: { backgroundColor: colors.backgroundTertiary },
    backBtnText: { color: colors.text },
  }), [colors]);

  const [sessions, setSessions] = useState<ProgressSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Indices into the sessions array
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(1);
  const [picking, setPicking] = useState<'left' | 'right' | null>(null);
  const [expandedUri, setExpandedUri] = useState<string | null>(null);

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
      <View style={[styles.centered, themed.container]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, themed.container]}>
        <ThemedText style={{ color: colors.error }}>{error}</ThemedText>
      </View>
    );
  }

  if (sessions.length < 2) {
    return (
      <View style={[styles.centered, themed.container]}>
        <Text style={[styles.emptyText, themed.emptyText]}>You need at least 2 sessions to compare.</Text>
        <Pressable style={[styles.backBtn, themed.backBtn]} onPress={() => router.back()}>
          <Text style={[styles.backBtnText, themed.backBtnText]}>Back to Gallery</Text>
        </Pressable>
      </View>
    );
  }

  const sessionLeft = sessions[leftIdx];
  const sessionRight = sessions[rightIdx];

  // Session picker overlay
  if (picking) {
    return (
      <View style={[styles.container, themed.container]}>
        <Text style={[styles.pickerTitle, themed.pickerTitle]}>
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
                  themed.pickerItem,
                  selected && [styles.pickerItemSelected, themed.pickerItemSelected],
                  disabled && styles.pickerItemDisabled,
                ]}
                disabled={disabled}
                onPress={() => {
                  if (picking === 'left') setLeftIdx(idx);
                  else setRightIdx(idx);
                  setPicking(null);
                }}
              >
                <Text style={[styles.pickerItemText, themed.pickerItemText, disabled && { color: colors.textTertiary }]}>
                  {formatDate(s.createdAt)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable style={[styles.backBtn, themed.backBtn]} onPress={() => setPicking(null)}>
          <Text style={[styles.backBtnText, themed.backBtnText]}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, themed.container]} contentContainerStyle={styles.scrollContent}>
      {/* Date selectors */}
      <View style={styles.dateRow}>
        <Pressable style={[styles.dateChip, themed.dateChip]} onPress={() => setPicking('left')}>
          <Text style={[styles.dateChipLabel, themed.dateChipLabel]}>Before</Text>
          <Text style={[styles.dateChipValue, themed.dateChipValue]}>{formatDate(sessionLeft.createdAt)}</Text>
        </Pressable>
        <Text style={[styles.vsText, themed.vsText]}>vs</Text>
        <Pressable style={[styles.dateChip, themed.dateChip]} onPress={() => setPicking('right')}>
          <Text style={[styles.dateChipLabel, themed.dateChipLabel]}>After</Text>
          <Text style={[styles.dateChipValue, themed.dateChipValue]}>{formatDate(sessionRight.createdAt)}</Text>
        </Pressable>
      </View>

      {/* Side-by-side photos per angle */}
      {ANGLE_KEYS.map(({ key, label }) => (
        <View key={key} style={styles.angleRow}>
          <Text style={[styles.angleLabel, themed.angleLabel]}>{label}</Text>
          <View style={styles.photoRow}>
            <Pressable style={styles.compareImageWrapper} onPress={() => setExpandedUri(sessionLeft[key] ?? null)}>
              <Image source={{ uri: sessionLeft[key] }} style={[styles.compareImage, themed.imagePlaceholder]} />
            </Pressable>
            <Pressable style={styles.compareImageWrapper} onPress={() => setExpandedUri(sessionRight[key] ?? null)}>
              <Image source={{ uri: sessionRight[key] }} style={[styles.compareImage, themed.imagePlaceholder]} />
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable style={[styles.backBtn, themed.backBtn]} onPress={() => router.back()}>
        <Text style={[styles.backBtnText, themed.backBtnText]}>Back to Gallery</Text>
      </Pressable>

      <Modal visible={!!expandedUri} transparent animationType="fade" onRequestClose={() => setExpandedUri(null)}>
        <Pressable style={styles.lightboxOverlay} onPress={() => setExpandedUri(null)}>
          <Image source={{ uri: expandedUri! }} style={styles.lightboxImage} resizeMode="contain" />
        </Pressable>
      </Modal>
    </ScrollView>
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
    borderRadius: 14,
    borderWidth: 1,
  },
  dateChipLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateChipValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  vsText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Angle comparison rows
  angleRow: {
    marginBottom: 20,
  },
  angleLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  compareImageWrapper: {
    flex: 1,
  },
  compareImage: {
    flex: 1,
    aspectRatio: 0.91,
    borderRadius: 14,
  },

  // Lightbox
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: '100%',
    height: '100%',
  },

  // Session picker
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    padding: 20,
    paddingBottom: 12,
  },
  pickerList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pickerItem: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  pickerItemSelected: {},
  pickerItemDisabled: {
    opacity: 0.4,
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Shared
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
