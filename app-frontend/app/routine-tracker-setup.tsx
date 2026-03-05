import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '../constants/api';
import { CrownMascot } from '@/components/CrownMascot';

// ─── Constants ───────────────────────────────────────────────

type TreatmentId = 'minoxidil' | 'finasteride' | 'microneedling' | 'ketoconazole' | 'hair_oils';

interface Treatment {
  id: TreatmentId;
  label: string;
  emoji: string;
  tip: string;
}

const TREATMENTS: Treatment[] = [
  { id: 'minoxidil', label: 'Minoxidil', emoji: '🧴', tip: 'Studies recommend taking Minoxidil once or twice daily' },
  { id: 'finasteride', label: 'Finasteride', emoji: '💊', tip: 'Studies recommend taking Finasteride once daily' },
  { id: 'microneedling', label: 'Microneedling', emoji: '🪡', tip: 'Studies recommend microneedling once or twice a week' },
  { id: 'ketoconazole', label: 'Ketoconazole', emoji: '🧴', tip: 'Studies recommend using Ketoconazole 2-3 times a week' },
  { id: 'hair_oils', label: 'Hair Oils', emoji: '🫧', tip: 'Apply hair oils as part of your daily routine' },
];

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'] as const;

type Step = 'loading' | 'select' | 'configure' | 'add-more' | 'complete';

// ─── Component ───────────────────────────────────────────────

export default function RoutineTrackerSetupScreen() {
  const router = useRouter();
  const { userId } = useAuth();

  // Flow state
  const [step, setStep] = useState<Step>('loading');
  const [selectedTreatments, setSelectedTreatments] = useState<TreatmentId[]>([]);
  const [configIndex, setConfigIndex] = useState(0);
  const [savedTreatments, setSavedTreatments] = useState<Set<TreatmentId>>(new Set());

  // Configure step state
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  // Tracker routine ID (created once, reused for all treatments)
  const [trackerRoutineId, setTrackerRoutineId] = useState<string | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Skip check on mount ────────────────────────────────────

  useEffect(() => {
    checkExistingRoutine();
  }, []);

  const checkExistingRoutine = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(API_ENDPOINTS.ROUTINE_EXISTS, {
        headers: { 'X-User-Id': userId ?? '' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.hasRoutine) {
        router.replace('/(tabs)');
        return;
      }
    } catch {
      // If check fails, just show the setup flow
    }
    setStep('select');
  };

  // ─── Treatment selection handlers ───────────────────────────

  const toggleTreatment = (id: TreatmentId) => {
    setSelectedTreatments((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSelectContinue = () => {
    if (selectedTreatments.length === 0) return;
    setConfigIndex(0);
    resetConfigState();
    setStep('configure');
  };

  // ─── Day/time config handlers ───────────────────────────────

  const resetConfigState = () => {
    setSelectedDays(new Set());
    setHour('08');
    setMinute('00');
    setPeriod('AM');
    setError(null);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const toggleDaily = () => {
    if (selectedDays.size === 7) {
      setSelectedDays(new Set());
    } else {
      setSelectedDays(new Set(ALL_DAYS));
    }
  };

  const to24Hour = useCallback((): string => {
    let h = parseInt(hour, 10) || 0;
    if (period === 'AM') {
      if (h === 12) h = 0;
    } else {
      if (h !== 12) h += 12;
    }
    const m = parseInt(minute, 10) || 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }, [hour, minute, period]);

  const ensureTrackerRoutine = async (headers: Record<string, string>): Promise<string | null> => {
    if (trackerRoutineId) return trackerRoutineId;

    // Check if routine already exists
    const getRes = await fetch(API_ENDPOINTS.TRACKER_ROUTINE, { headers });
    const getData = await getRes.json();
    if (getData.success && getData.data) {
      setTrackerRoutineId(getData.data.id);
      return getData.data.id;
    }

    // Create new routine
    const postRes = await fetch(API_ENDPOINTS.TRACKER_ROUTINE, {
      method: 'POST',
      headers,
    });
    const postData = await postRes.json();
    if (postData.success && postData.data) {
      setTrackerRoutineId(postData.data.id);
      return postData.data.id;
    }

    return null;
  };

  const handleConfigContinue = async () => {
    if (selectedDays.size === 0) {
      setError('Please select at least one day');
      return;
    }

    const treatment = selectedTreatments[configIndex];
    const treatmentInfo = TREATMENTS.find((t) => t.id === treatment);
    setSaving(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Id': userId ?? '',
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Save to legacy routine system
      const response = await fetch(API_ENDPOINTS.ROUTINE, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          treatmentType: treatment,
          timeOfDay: to24Hour(),
          daysOfWeek: Array.from(selectedDays),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Failed to save treatment');
        return;
      }

      // Also save to tracker system (routine + treatment)
      const routineId = await ensureTrackerRoutine(headers);
      if (routineId) {
        await fetch(API_ENDPOINTS.TRACKER_TREATMENTS, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: treatmentInfo?.label ?? treatment,
            frequencyPerWeek: selectedDays.size,
          }),
        });
      }

      // Mark saved
      setSavedTreatments((prev) => new Set(prev).add(treatment));

      // Advance or move to add-more
      if (configIndex < selectedTreatments.length - 1) {
        setConfigIndex(configIndex + 1);
        resetConfigState();
      } else {
        setStep('add-more');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Add more handlers ──────────────────────────────────────

  const handleAddAnother = () => {
    setSelectedTreatments([]);
    setConfigIndex(0);
    resetConfigState();
    setStep('select');
  };

  // ─── Render helpers ─────────────────────────────────────────

  const availableTreatments = TREATMENTS.filter((t) => !savedTreatments.has(t.id));
  const currentTreatment = TREATMENTS.find((t) => t.id === selectedTreatments[configIndex]);
  const isDaily = selectedDays.size === 7;

  // ─── Loading ────────────────────────────────────────────────

  if (step === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Step 1: Treatment Selection ────────────────────────────

  if (step === 'select') {
    const hasSelection = selectedTreatments.length > 0;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Text style={styles.headerText}>Routine Tracker - Setup</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.selectTitleRow}>
            <Text style={styles.selectTitle}>
              Please select the{'\n'}treatments you would like{'\n'}to track
            </Text>
            {/* Small crown mascot */}
            <CrownMascot state="neutral" size={56} />
          </View>

          <View style={styles.treatmentList}>
            {availableTreatments.map((t) => {
              const isSelected = selectedTreatments.includes(t.id);
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.treatmentPill, isSelected && styles.treatmentPillSelected]}
                  onPress={() => toggleTreatment(t.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.treatmentEmoji}>{t.emoji}</Text>
                  <Text style={styles.treatmentLabel}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {availableTreatments.length === 0 && (
            <Text style={styles.allSavedText}>All treatments have been configured!</Text>
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, !hasSelection && styles.continueButtonDisabled]}
            onPress={handleSelectContinue}
            disabled={!hasSelection}
            activeOpacity={0.8}
          >
            <Text style={[styles.continueButtonText, !hasSelection && styles.continueButtonTextDisabled]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Step 2: Day & Time Config ──────────────────────────────

  if (step === 'configure' && currentTreatment) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Text style={styles.headerText}>Routine Tracker - Setup</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.configTitle}>
            How often would you like to take {currentTreatment.label}
          </Text>

          {/* Tip */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipEmoji}>👑</Text>
            <Text style={styles.tipText}>{currentTreatment.tip}</Text>
          </View>

          <Text style={styles.sectionLabel}>Please select the days of the week and the time</Text>

          {/* Day selector */}
          <View style={styles.dayGrid}>
            <TouchableOpacity
              style={[styles.dayChip, isDaily && styles.dayChipSelected]}
              onPress={toggleDaily}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayChipText, isDaily && styles.dayChipTextSelected]}>Daily</Text>
            </TouchableOpacity>
            {ALL_DAYS.map((day, i) => {
              const active = selectedDays.has(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayChip, active && styles.dayChipSelected]}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayChipText, active && styles.dayChipTextSelected]}>
                    {DAY_LABELS[i]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Time picker */}
          <View style={styles.timePickerContainer}>
            <View style={styles.timeInputGroup}>
              <TextInput
                style={styles.timeInput}
                value={hour}
                onChangeText={(v) => {
                  const num = v.replace(/[^0-9]/g, '');
                  if (num === '' || (parseInt(num, 10) >= 0 && parseInt(num, 10) <= 12)) {
                    setHour(num.slice(0, 2));
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={minute}
                onChangeText={(v) => {
                  const num = v.replace(/[^0-9]/g, '');
                  if (num === '' || (parseInt(num, 10) >= 0 && parseInt(num, 10) <= 59)) {
                    setMinute(num.slice(0, 2));
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
            </View>

            <View style={styles.periodToggle}>
              <TouchableOpacity
                style={[styles.periodButton, period === 'AM' && styles.periodButtonActive]}
                onPress={() => setPeriod('AM')}
              >
                <Text style={[styles.periodText, period === 'AM' && styles.periodTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, period === 'PM' && styles.periodButtonActive]}
                onPress={() => setPeriod('PM')}
              >
                <Text style={[styles.periodText, period === 'PM' && styles.periodTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, saving && styles.continueButtonDisabled]}
            onPress={handleConfigContinue}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Step 3: Add More? ──────────────────────────────────────

  if (step === 'add-more') {
    const hasMore = availableTreatments.length > 0;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Text style={styles.headerText}>Routine Tracker - Setup</Text>
        </View>

        <View style={styles.centeredContent}>
          {/* Crown mascot */}
          <View style={styles.mascotSection}>
            <CrownMascot state="neutral" size={130} />
          </View>

          <Text style={styles.addMoreHeading}>
            Would you like to add another product?
          </Text>
          <Text style={styles.addMoreSubtext}>
            You can always add more treatments later from your settings.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {hasMore && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleAddAnother}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Add Another</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.continueButton, hasMore && { marginTop: 12 }]}
            onPress={() => setStep('complete')}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Step 4: Complete ───────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerText}>Routine Tracker - Setup</Text>
      </View>

      <View style={styles.centeredContent}>
        {/* Crown mascot */}
        <View style={styles.mascotSection}>
          <CrownMascot state="completion" size={130} />
        </View>

        <Text style={styles.completeHeading}>You're all set!</Text>
        <Text style={styles.completeSubtext}>
          Your routine has been logged. Remember to stay consistent to see results. You got this!
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  // ── Select step ──────────────────────────────

  selectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 24,
    paddingBottom: 24,
  },
  selectTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    lineHeight: 28,
    flex: 1,
    marginRight: 16,
  },


  // Treatment list
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
  treatmentPillSelected: {
    borderColor: '#C4A882',
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

  // ── Configure step ───────────────────────────

  configTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    lineHeight: 30,
    paddingTop: 24,
    paddingBottom: 16,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipText: {
    fontSize: 13,
    color: '#636366',
    flex: 1,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#636366',
    marginBottom: 14,
  },

  // Day chips
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  dayChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
  },
  dayChipSelected: {
    backgroundColor: '#C4A882',
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  dayChipTextSelected: {
    color: '#FFFFFF',
  },

  // Time picker
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  timeInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 72,
    height: 72,
    backgroundColor: '#F5EDDF',
    borderRadius: 16,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1C1C1E',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1E',
    marginHorizontal: 6,
  },
  periodToggle: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  periodButtonActive: {
    backgroundColor: '#F5EDDF',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  periodTextActive: {
    color: '#1C1C1E',
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

  // ── Add more step ────────────────────────────

  addMoreHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 12,
  },
  addMoreSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },

  // ── Complete step ────────────────────────────

  completeHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 12,
  },
  completeSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },

  // ── Crown mascot (shared) ───────────────────

  mascotSection: {
    alignItems: 'center',
  },

  // ── Buttons (shared) ────────────────────────

  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#F8F8F8',
  },
  continueButton: {
    backgroundColor: '#C4A882',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  continueButtonDisabled: {
    backgroundColor: '#DDDDDD',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#8E8E93',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderWidth: 2,
    borderColor: '#C4A882',
  },
  secondaryButtonText: {
    color: '#C4A882',
    fontSize: 16,
    fontWeight: '600',
  },
});
