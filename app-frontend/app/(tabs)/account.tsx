import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/constants/api';
import { useRouter } from 'expo-router';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/api/notifications';

export default function AccountScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const { isDarkMode, colorScheme, toggleDarkMode } = useThemeContext();
  const dark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Notification preferences
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [reminderHour, setReminderHour] = useState(9);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const loadNotifPrefs = useCallback(async () => {
    if (!user?.id) return;
    try {
      const prefs = await fetchNotificationPreferences(user.id);
      setNotifEnabled(prefs.enabled);
      setReminderHour(prefs.reminderHour);
    } catch {
      // Use defaults
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifPrefs();
  }, [loadNotifPrefs]);

  const handleToggleNotifications = async (value: boolean) => {
    setNotifEnabled(value);
    if (!user?.id) return;
    try {
      await updateNotificationPreferences(user.id, {
        enabled: value,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch {
      setNotifEnabled(!value); // Revert on failure
    }
  };

  const handleSelectTime = async (hour: number) => {
    setReminderHour(hour);
    setShowTimePicker(false);
    if (!user?.id) return;
    try {
      await updateNotificationPreferences(user.id, {
        reminderHour: hour,
        reminderMinute: 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch {
      // Revert silently
      loadNotifPrefs();
    }
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:00 ${period}`;
  };

  const themed = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    title: { color: colors.text },
    card: { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.cardBorder },
    userName: { color: colors.text },
    rowLabel: { color: colors.text },
    detailValue: { color: colors.text },
    divider: { backgroundColor: colors.divider },
    detailBorder: { borderTopColor: colors.divider },
    signOutBtn: { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.cardBorder },
    modalBg: { backgroundColor: colors.background },
    modalTitle: { color: colors.text },
    textArea: {
      backgroundColor: colors.backgroundTertiary,
      borderColor: colors.border,
      color: colors.text,
    },
    submitBtn: { backgroundColor: colors.accent },
    submitBtnText: { color: colors.textInverse },
    avatar: { backgroundColor: colors.accent },
    avatarText: { color: colors.textInverse },
  }), [dark, colors]);

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.FEEDBACK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id ?? '',
        },
        body: JSON.stringify({ message: feedbackText.trim() }),
      });
      if (!res.ok) throw new Error('Failed to submit feedback');
      setFeedbackText('');
      setFeedbackVisible(false);
      Alert.alert('Thank you!', 'Your feedback has been submitted successfully.');
    } catch {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomerSupport = () => {
    Linking.openURL('mailto:support@follixapp.tech');
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch(API_ENDPOINTS.ACCOUNT, {
        method: 'DELETE',
        headers: { 'X-User-Id': user?.id ?? '' },
      });
      if (!res.ok) throw new Error('Failed to delete account');
      await signOut();
      router.replace('/sign-in');
    } catch {
      Alert.alert('Error', 'Failed to delete your account. Please try again or contact support.');
    } finally {
      setDeletingAccount(false);
      setDeleteAccountVisible(false);
    }
  };

  return (
    <ScrollView style={[styles.screen, themed.screen]} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.headerLabel}>Account</Text>
      <Text style={[styles.title, themed.title]}>Settings</Text>

      {/* User Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={[styles.card, themed.card]}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, themed.avatar]}>
              <Text style={[styles.avatarText, themed.avatarText]}>
                {(user?.firstName?.[0] ?? '').toUpperCase()}
                {(user?.lastName?.[0] ?? '').toUpperCase()}
              </Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={[styles.userName, themed.userName]}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail}>
                {user?.primaryEmailAddress?.emailAddress ?? 'No email'}
              </Text>
            </View>
          </View>
          {user?.createdAt && (
            <View style={[styles.detailRow, themed.detailBorder]}>
              <Text style={styles.detailLabel}>Member since</Text>
              <Text style={[styles.detailValue, themed.detailValue]}>
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Settings Rows */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <View style={[styles.card, themed.card]}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>🌙</Text>
            <Text style={[styles.rowLabel, themed.rowLabel]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.rowDivider, themed.divider]} />

          <Pressable
            style={styles.row}
            onPress={() => router.push('/account/privacy')}
          >
            <Text style={styles.rowIcon}>🔒</Text>
            <Text style={[styles.rowLabel, themed.rowLabel]}>Privacy Policy</Text>
            <Text style={styles.rowChevron}>›</Text>
          </Pressable>

          <View style={[styles.rowDivider, themed.divider]} />

          <Pressable
            style={styles.row}
            onPress={() => setFeedbackVisible(true)}
          >
            <Text style={styles.rowIcon}>💬</Text>
            <Text style={[styles.rowLabel, themed.rowLabel]}>Submit Feedback</Text>
            <Text style={styles.rowChevron}>›</Text>
          </Pressable>

          <View style={[styles.rowDivider, themed.divider]} />

          <Pressable style={styles.row} onPress={handleCustomerSupport}>
            <Text style={styles.rowIcon}>✉️</Text>
            <Text style={[styles.rowLabel, themed.rowLabel]}>Customer Support</Text>
            <Text style={styles.rowChevron}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={[styles.card, themed.card]}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>🔔</Text>
            <Text style={[styles.rowLabel, themed.rowLabel]}>Daily Reminders</Text>
            <Switch
              value={notifEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor="#fff"
            />
          </View>

          {notifEnabled && (
            <>
              <View style={[styles.rowDivider, themed.divider]} />
              <Pressable style={styles.row} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.rowIcon}>🕐</Text>
                <Text style={[styles.rowLabel, themed.rowLabel]}>Reminder Time</Text>
                <Text style={[styles.timeValue, { color: colors.accent }]}>{formatHour(reminderHour)}</Text>
                <Text style={styles.rowChevron}>›</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={[styles.modalContainer, themed.modalBg]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, themed.modalTitle]}>Select Reminder Time</Text>
            <Pressable onPress={() => setShowTimePicker(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </Pressable>
          </View>
          <ScrollView>
            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
              <Pressable
                key={hour}
                style={[
                  styles.timeOption,
                  hour === reminderHour && { backgroundColor: colors.accent + '20' },
                ]}
                onPress={() => handleSelectTime(hour)}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    { color: colors.text },
                    hour === reminderHour && { color: colors.accent, fontWeight: '700' },
                  ]}
                >
                  {formatHour(hour)}
                </Text>
                {hour === reminderHour && (
                  <Text style={{ color: colors.accent, fontSize: 16 }}>✓</Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Sign Out */}
      <Pressable
        style={[styles.signOutBtn, themed.signOutBtn]}
        onPress={async () => {
          await signOut();
          router.replace('/sign-in');
        }}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      {/* Delete Account */}
      <Pressable
        style={styles.deleteAccountBtn}
        onPress={() => setDeleteAccountVisible(true)}
      >
        <Text style={styles.deleteAccountText}>Delete Account</Text>
      </Pressable>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteAccountVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDeleteAccountVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={[styles.deleteModalCard, themed.card]}>
            <Text style={[styles.deleteModalTitle, themed.title]}>Delete Account?</Text>
            <Text style={styles.deleteModalBody}>
              This will permanently delete your account and all associated data — including your progress photos, routine logs, and notification settings.{'\n\n'}This action cannot be undone.
            </Text>
            <Pressable
              style={[styles.deleteConfirmBtn, deletingAccount && styles.submitBtnDisabled]}
              onPress={handleDeleteAccount}
              disabled={deletingAccount}
            >
              <Text style={styles.deleteConfirmBtnText}>
                {deletingAccount ? 'Deleting...' : 'Yes, Delete My Account'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.deleteCancelBtn}
              onPress={() => setDeleteAccountVisible(false)}
              disabled={deletingAccount}
            >
              <Text style={[styles.deleteCancelBtnText, { color: colors.accent }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        visible={feedbackVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFeedbackVisible(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalContainer, themed.modalBg]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, themed.modalTitle]}>Submit Feedback</Text>
            <Pressable onPress={() => setFeedbackVisible(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </Pressable>
          </View>

          <TextInput
            style={[styles.textArea, themed.textArea]}
            multiline
            placeholder="We are always looking for ways to improve Follix and would love to hear from you."
            placeholderTextColor="#999"
            value={feedbackText}
            onChangeText={setFeedbackText}
            textAlignVertical="top"
          />

          <Pressable
            style={[
              styles.submitBtn,
              themed.submitBtn,
              (!feedbackText.trim() || submitting) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmitFeedback}
            disabled={!feedbackText.trim() || submitting}
          >
            <Text style={[styles.submitBtnText, themed.submitBtnText]}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    padding: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
  },
  rowChevron: {
    fontSize: 22,
    color: '#C8C8C8',
    fontWeight: '300',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
  },
  signOutBtn: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: '#D44332',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 16,
    color: '#C4A882',
  },
  textArea: {
    flex: 1,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  timeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 2,
  },
  timeOptionText: {
    fontSize: 17,
  },
  deleteAccountBtn: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteAccountText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deleteModalCard: {
    width: '100%',
    borderRadius: 18,
    padding: 24,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  deleteModalBody: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteConfirmBtn: {
    backgroundColor: '#D44332',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteConfirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  deleteCancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteCancelBtnText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
