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

// ─── Constants ───────────────────────────────────────────────

type TreatmentId = 'minoxidil' | 'finasteride' | 'microneedling' | 'ketoconazole' | 'hair_oils';

interface TreatmentOption {
  id: TreatmentId;
  label: string;
  emoji: string;
  tip: string;
}

const TREATMENTS: TreatmentOption[] = [
  { id: 'minoxidil', label: 'Minoxidil', emoji: '🧴', tip: 'Studies recommend taking Minoxidil once or twice daily' },
  { id: 'finasteride', label: 'Finasteride', emoji: '💊', tip: 'Studies recommend taking Finasteride once daily' },
  { id: 'microneedling', label: 'Microneedling', emoji: '🪡', tip: 'Studies recommend microneedling once or twice a week' },
  { id: 'ketoconazole', label: 'Ketoconazole', emoji: '🧴', tip: 'Studies recommend using Ketoconazole 2-3 times a week' },
  { id: 'hair_oils', label: 'Hair Oils', emoji: '🫧', tip: 'Apply hair oils as part of your daily routine' },
];

const FREQUENCY_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

interface ExistingTreatment {
  id: string;
  name: string;
  frequencyPerWeek: number;
}

interface EditableTreatment {
  serverId: string | null; // null = newly added
  name: string;
  frequencyPerWeek: number;
  deleted: boolean;
}

// ─── Component ───────────────────────────────────────────────

export default function EditRoutineScreen() {
  const router = useRouter();
  const { userId } = useAuth();

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
          frequencyPerWeek: t.frequencyPerWeek,
        }));
        setOriginalTreatments(existing);
        setTreatments(
          existing.map((t) => ({
            serverId: t.id,
            name: t.name,
            frequencyPerWeek: t.frequencyPerWeek,
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

  const updateFrequency = (index: number, freq: number) => {
    setTreatments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], frequencyPerWeek: freq };
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
          frequencyPerWeek: 7,
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
          // PATCH updated treatments (check if frequency changed)
          const original = originalTreatments.find((o) => o.id === treatment.serverId);
          if (original && original.frequencyPerWeek !== treatment.frequencyPerWeek) {
            promises.push(
              fetch(`${API_ENDPOINTS.TRACKER_TREATMENTS}/${treatment.serverId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ frequencyPerWeek: treatment.frequencyPerWeek }),
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
                frequencyPerWeek: treatment.frequencyPerWeek,
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
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Add Treatment Picker ─────────────────────────────────

  if (showAddPicker) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowAddPicker(false)}>
            <Text style={styles.backText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Add Treatment</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.selectTitle}>Select a treatment to add</Text>

          <View style={styles.treatmentList}>
            {availableToAdd.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.treatmentPill}
                onPress={() => addTreatment(t)}
                activeOpacity={0.7}
              >
                <Text style={styles.treatmentEmoji}>{t.emoji}</Text>
                <Text style={styles.treatmentLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {availableToAdd.length === 0 && (
            <Text style={styles.allSavedText}>All available treatments are already in your routine.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Main Edit View ───────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Routine</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Your Treatments</Text>

        {activeTreatments.length === 0 && (
          <Text style={styles.emptyText}>No treatments. Add one below.</Text>
        )}

        {treatments.map((treatment, index) => {
          if (treatment.deleted) return null;
          const meta = getTreatmentMeta(treatment.name);
          return (
            <View key={treatment.serverId ?? `new-${index}`} style={styles.treatmentCard}>
              <View style={styles.treatmentCardHeader}>
                <View style={styles.treatmentInfo}>
                  <Text style={styles.treatmentEmoji}>{meta?.emoji ?? '💊'}</Text>
                  <Text style={styles.treatmentCardName}>{treatment.name}</Text>
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
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>

              {meta?.tip && (
                <View style={styles.tipContainer}>
                  <Text style={styles.tipEmoji}>👑</Text>
                  <Text style={styles.tipText}>{meta.tip}</Text>
                </View>
              )}

              <Text style={styles.freqLabel}>Days per week</Text>
              <View style={styles.freqRow}>
                {FREQUENCY_OPTIONS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.freqChip,
                      treatment.frequencyPerWeek === f && styles.freqChipSelected,
                    ]}
                    onPress={() => updateFrequency(index, f)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.freqChipText,
                        treatment.frequencyPerWeek === f && styles.freqChipTextSelected,
                      ]}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {/* Add treatment button */}
        {availableToAdd.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Add Treatment</Text>
          </TouchableOpacity>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
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
    backgroundColor: '#F8F8F8',
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
    color: '#1C1C1E',
  },
  backText: {
    fontSize: 16,
    color: '#8E8E93',
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
    color: '#1C1C1E',
    paddingTop: 16,
    paddingBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 32,
  },

  // Treatment card
  treatmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBEBEB',
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
    color: '#1C1C1E',
  },
  removeText: {
    fontSize: 14,
    color: '#D44332',
    fontWeight: '500',
  },

  // Tip
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  tipEmoji: {
    fontSize: 18,
  },
  tipText: {
    fontSize: 13,
    color: '#636366',
    flex: 1,
    lineHeight: 18,
  },

  // Frequency selector
  freqLabel: {
    fontSize: 13,
    color: '#636366',
    marginBottom: 8,
  },
  freqRow: {
    flexDirection: 'row',
    gap: 8,
  },
  freqChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqChipSelected: {
    backgroundColor: '#C4A882',
  },
  freqChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  freqChipTextSelected: {
    color: '#FFFFFF',
  },

  // Add button
  addButton: {
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#636366',
  },

  // Add picker (reusing onboarding styles)
  selectTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
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
    backgroundColor: '#F5EDDF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  treatmentEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  treatmentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  allSavedText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 40,
  },

  // Error
  errorText: {
    fontSize: 14,
    color: '#D44332',
    padding: 12,
    backgroundColor: '#FDF2F0',
    borderRadius: 12,
    marginTop: 8,
  },

  // Save button
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#F8F8F8',
  },
  saveButton: {
    backgroundColor: '#C4A882',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  saveButtonDisabled: {
    backgroundColor: '#DDDDDD',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
