import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '../../constants/api';
import Svg, { Path } from 'react-native-svg';
import { useThemeContext } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { DutasterideIcon } from '@/components/icons/DutasterideIcon';
import { FinasterideIcon } from '@/components/icons/FinasterideIcon';
import { MinoxidilIcon } from '@/components/icons/MinoxidilIcon';
import { MicroneedlingIcon } from '@/components/icons/MicroneedlingIcon';
import { KetoconazoleIcon } from '@/components/icons/KetoconazoleIcon';
import { PumpkinSeedOilIcon } from '@/components/icons/PumpkinSeedOilIcon';
import { RosemaryOilIcon } from '@/components/icons/RosemaryOilIcon';
import { ScalpMassagerIcon } from '@/components/icons/ScalpMassagerIcon';

// ─── Constants ───────────────────────────────────────────────

type TreatmentId = 'minoxidil' | 'finasteride' | 'dutasteride' | 'microneedling' | 'ketoconazole' | 'pumpkin_seed_oil' | 'rosemary_oil' | 'scalp_massage';

interface TreatmentOption {
  id: TreatmentId;
  label: string;
  emoji: string;
  icon?: React.ComponentType<{ size?: number }>;
  tip: string;
}

const TREATMENTS: TreatmentOption[] = [
  { id: 'minoxidil', label: 'Minoxidil', emoji: '💧', icon: MinoxidilIcon, tip: 'Studies recommend taking Minoxidil once or twice daily' },
  { id: 'finasteride', label: 'Finasteride', emoji: '💊', icon: FinasterideIcon, tip: 'Studies recommend taking Finasteride once daily' },
  { id: 'dutasteride', label: 'Dutasteride', emoji: '💊', icon: DutasterideIcon, tip: 'Studies recommend taking Dutasteride once daily' },
  { id: 'microneedling', label: 'Microneedling', emoji: '🪡', icon: MicroneedlingIcon, tip: 'Studies recommend microneedling once or twice a week' },
  { id: 'ketoconazole', label: 'Ketoconazole', emoji: '🧴', icon: KetoconazoleIcon, tip: 'Studies recommend using Ketoconazole 2-3 times a week' },
  { id: 'pumpkin_seed_oil', label: 'Pumpkin Seed Oil', emoji: '🎃', icon: PumpkinSeedOilIcon, tip: 'Studies suggest taking pumpkin seed oil daily as a supplement' },
  { id: 'rosemary_oil', label: 'Rosemary Oil', emoji: '🌿', icon: RosemaryOilIcon, tip: 'Studies recommend applying rosemary oil to the scalp daily' },
  { id: 'scalp_massage', label: 'Scalp Massage', emoji: '✋', icon: ScalpMassagerIcon, tip: 'Studies recommend scalp massage for 5-10 minutes daily' },
];

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'] as const;

interface ExistingTreatment {
  id: string;
  name: string;
  daysOfWeek: string[];
}

interface EditableTreatment {
  serverId: string | null; // null = newly added
  name: string;
  selectedDays: Set<string>;
  deleted: boolean;
}

// ─── Component ───────────────────────────────────────────────

export default function EditRoutineScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The treatments being edited
  const [treatments, setTreatments] = useState<EditableTreatment[]>([]);
  // Track which treatments existed originally (for diffing on save)
  const [originalTreatments, setOriginalTreatments] = useState<ExistingTreatment[]>([]);
  // Show add treatment picker
  const [showAddPicker, setShowAddPicker] = useState(false);

  // ─── Load existing treatments ──────────────────────────────

  useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.TRACKER_TREATMENTS, {
        headers: { 'X-User-Id': userId ?? '' },
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const existing: ExistingTreatment[] = data.data.map((t: any) => ({
          id: t.id,
          name: t.name,
          daysOfWeek: Array.isArray(t.daysOfWeek) && t.daysOfWeek.length > 0
            ? t.daysOfWeek
            : [...ALL_DAYS],
        }));
        setOriginalTreatments(existing);
        setTreatments(
          existing.map((t) => ({
            serverId: t.id,
            name: t.name,
            selectedDays: new Set(t.daysOfWeek),
            deleted: false,
          }))
        );
      }
    } catch {
      setError('Failed to load your treatments.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Treatment editing handlers ────────────────────────────

  const activeTreatments = treatments.filter((t) => !t.deleted);
  const activeNames = new Set(activeTreatments.map((t) => t.name));

  const availableToAdd = TREATMENTS.filter((t) => !activeNames.has(t.label));

  const toggleDay = (index: number, day: string) => {
    setTreatments((prev) => {
      const next = [...prev];
      const days = new Set(next[index].selectedDays);
      if (days.has(day)) {
        days.delete(day);
      } else {
        days.add(day);
      }
      next[index] = { ...next[index], selectedDays: days };
      return next;
    });
  };

  const toggleDaily = (index: number) => {
    setTreatments((prev) => {
      const next = [...prev];
      const isDaily = next[index].selectedDays.size === 7;
      next[index] = { ...next[index], selectedDays: isDaily ? new Set() : new Set(ALL_DAYS) };
      return next;
    });
  };

  const removeTreatment = (index: number) => {
    setTreatments((prev) => {
      const next = [...prev];
      if (next[index].serverId) {
        // Mark for deletion on save
        next[index] = { ...next[index], deleted: true };
      } else {
        // Newly added, just remove from list
        next.splice(index, 1);
      }
      return next;
    });
  };

  const addTreatment = (option: TreatmentOption) => {
    // Check if this was a previously deleted treatment with a server ID
    const deletedIndex = treatments.findIndex(
      (t) => t.name === option.label && t.deleted
    );
    if (deletedIndex !== -1) {
      // Restore it
      setTreatments((prev) => {
        const next = [...prev];
        next[deletedIndex] = { ...next[deletedIndex], deleted: false };
        return next;
      });
    } else {
      setTreatments((prev) => [
        ...prev,
        {
          serverId: null,
          name: option.label,
          selectedDays: new Set(ALL_DAYS),
          deleted: false,
        },
      ]);
    }
    setShowAddPicker(false);
  };

  // ─── Save changes ─────────────────────────────────────────

  const handleSave = async () => {
    const active = treatments.filter((t) => !t.deleted);
    if (active.length === 0) {
      setError('You need at least one treatment in your routine.');
      return;
    }

    setSaving(true);
    setError(null);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User-Id': userId ?? '',
    };

    try {
      const promises: Promise<any>[] = [];

      for (const treatment of treatments) {
        if (treatment.deleted && treatment.serverId) {
          // DELETE removed treatments
          promises.push(
            fetch(`${API_ENDPOINTS.TRACKER_TREATMENTS}/${treatment.serverId}`, {
              method: 'DELETE',
              headers,
            })
          );
        } else if (!treatment.deleted && treatment.serverId) {
          // PATCH updated treatments (check if days changed)
          const original = originalTreatments.find((o) => o.id === treatment.serverId);
          const newDays = Array.from(treatment.selectedDays);
          const originalDaysSet = new Set(original?.daysOfWeek ?? []);
          const daysChanged = newDays.length !== originalDaysSet.size || newDays.some((d) => !originalDaysSet.has(d));
          if (daysChanged) {
            promises.push(
              fetch(`${API_ENDPOINTS.TRACKER_TREATMENTS}/${treatment.serverId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ daysOfWeek: newDays }),
              })
            );
          }
        } else if (!treatment.deleted && !treatment.serverId) {
          // POST new treatments
          promises.push(
            fetch(API_ENDPOINTS.TRACKER_TREATMENTS, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                name: treatment.name,
                daysOfWeek: Array.from(treatment.selectedDays),
              }),
            })
          );
        }
      }

      const results = await Promise.all(promises);
      const allOk = results.every((r) => r.ok);

      if (!allOk) {
        setError('Some changes could not be saved. Please try again.');
        return;
      }

      // Navigate back to tracker — it will re-fetch data on mount
      router.back();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Get treatment display info ────────────────────────────

  const getTreatmentMeta = (name: string) => {
    return TREATMENTS.find((t) => t.label === name);
  };

  // ─── Loading ──────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Add Treatment Picker ─────────────────────────────────

  if (showAddPicker) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowAddPicker(false)}>
            <Text style={[styles.backText, { color: colors.textTertiary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: colors.text }]}>Add Treatment</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.selectTitle, { color: colors.text }]}>Select a treatment to add</Text>

          <View style={styles.treatmentList}>
            {availableToAdd.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.treatmentPill, { backgroundColor: colors.accentSurface }]}
                onPress={() => addTreatment(t)}
                activeOpacity={0.7}
              >
                <View style={styles.treatmentIconContainer}>
                  {t.icon ? <t.icon size={28} /> : <Text style={styles.treatmentEmoji}>{t.emoji}</Text>}
                </View>
                <Text style={[styles.treatmentLabel, { color: colors.text }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {availableToAdd.length === 0 && (
            <Text style={[styles.allSavedText, { color: colors.textTertiary }]}>All available treatments are already in your routine.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Main Edit View ───────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.textTertiary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: colors.text }]}>Edit Routine</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Treatments</Text>

        {activeTreatments.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No treatments. Add one below.</Text>
        )}

        {treatments.map((treatment, index) => {
          if (treatment.deleted) return null;
          const meta = getTreatmentMeta(treatment.name);
          return (
            <View key={treatment.serverId ?? `new-${index}`} style={[styles.treatmentCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
              <View style={styles.treatmentCardHeader}>
                <View style={styles.treatmentInfo}>
                  <View style={styles.treatmentIconContainer}>
                    {meta?.icon ? <meta.icon size={28} /> : <Text style={styles.treatmentEmoji}>{meta?.emoji ?? '💊'}</Text>}
                  </View>
                  <Text style={[styles.treatmentCardName, { color: colors.text }]}>{treatment.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Remove Treatment',
                      `Remove ${treatment.name} from your routine?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => removeTreatment(index),
                        },
                      ]
                    );
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.removeText, { color: colors.error }]}>Remove</Text>
                </TouchableOpacity>
              </View>

              {meta?.tip && (
                <View style={[styles.tipContainer, { backgroundColor: colors.accentBackground }]}>
                  <Svg width={36} height={36} viewBox="0 0 500 500" fill="none">
                    <Path d="M250 50 C280 50 310 140 335 175 C340 180 390 155 440 145 C460 140 465 160 455 180 C440 210 425 350 415 385 C390 440 110 440 85 385 C75 350 60 210 45 180 C35 160 40 140 60 145 C110 155 160 180 165 175 C190 140 220 50 250 50Z" fill="#FFFCE6" stroke="#8C8679" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M150 245 C170 270 210 270 230 245" stroke="#8C8679" strokeWidth={13} strokeLinecap="round" fill="none" />
                    <Path d="M275 245 C295 270 335 270 355 245" stroke="#8C8679" strokeWidth={13} strokeLinecap="round" fill="none" />
                    <Path d="M220 295 C235 315 265 315 280 295" stroke="#8C8679" strokeWidth={13} strokeLinecap="round" fill="none" />
                  </Svg>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>{meta.tip}</Text>
                </View>
              )}

              <Text style={[styles.freqLabel, { color: colors.textSecondary }]}>Days per week</Text>
              <View style={styles.dayGrid}>
                <TouchableOpacity
                  style={[styles.dayChip, { backgroundColor: colors.backgroundTertiary }, treatment.selectedDays.size === 7 && { backgroundColor: colors.accent }]}
                  onPress={() => toggleDaily(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayChipText, { color: colors.text }, treatment.selectedDays.size === 7 && styles.dayChipTextSelected]}>Daily</Text>
                </TouchableOpacity>
                {ALL_DAYS.map((day, i) => {
                  const active = treatment.selectedDays.has(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayChip, { backgroundColor: colors.backgroundTertiary }, active && { backgroundColor: colors.accent }]}
                      onPress={() => toggleDay(index, day)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dayChipText, { color: colors.text }, active && styles.dayChipTextSelected]}>
                        {DAY_LABELS[i]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Add treatment button */}
        {availableToAdd.length > 0 && (
          <TouchableOpacity
            style={[styles.addButton, { borderColor: colors.border }]}
            onPress={() => setShowAddPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.addButtonText, { color: colors.textSecondary }]}>+ Add Treatment</Text>
          </TouchableOpacity>
        )}

        {error && <Text style={[styles.errorText, { color: colors.error, backgroundColor: colors.errorBackground }]}>{error}</Text>}
      </ScrollView>

      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.accent }, saving && { backgroundColor: colors.switchTrackOff }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backText: {
    fontSize: 16,
    width: 60,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  // Section
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingTop: 16,
    paddingBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
  },

  // Treatment card
  treatmentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  treatmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  treatmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  treatmentCardName: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Tip
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Frequency selector
  freqLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  dayChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dayChipTextSelected: {
    color: '#FFFFFF',
  },

  // Add button
  addButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Add picker
  selectTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    paddingTop: 24,
    paddingBottom: 24,
  },
  treatmentList: {
    gap: 12,
  },
  treatmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  treatmentIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  treatmentEmoji: {
    fontSize: 22,
  },
  treatmentLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  allSavedText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 40,
  },

  // Error
  errorText: {
    fontSize: 14,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },

  // Save button
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
