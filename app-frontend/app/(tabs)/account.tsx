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
import React, { useState, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

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
    Linking.openURL('mailto:support@follixapp.com');
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

      {/* Sign Out */}
      <Pressable style={[styles.signOutBtn, themed.signOutBtn]} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

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
});
