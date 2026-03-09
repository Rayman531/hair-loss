import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React from 'react';
import { CrownMascot } from '@/components/CrownMascot';
import { useThemeContext } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme];

  const handleCreateAccount = () => {
    router.push('/sign-up');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.content}>
        {/* Crown mascot — completion state with badge */}
        <View style={styles.mascotSection}>
          <CrownMascot state="completion" size={130} />
        </View>

        {/* Thank you message */}
        <View style={styles.messageSection}>
          <Text style={[styles.heading, { color: colors.text }]}>
            Thank you for taking the time to answer our questions!
          </Text>

          <Text style={[styles.subtext, { color: colors.textTertiary }]}>
            Sign up and unlock your routine and progress tracker as well as other hair loss insights based off your onboarding!
          </Text>
        </View>
      </View>

      {/* Create Account button - fixed at bottom */}
      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.createAccountButton, { backgroundColor: colors.accent }]}
          onPress={handleCreateAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.createAccountButtonText}>
            Create Your Account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  // Mascot section
  mascotSection: {
    alignItems: 'center',
    marginBottom: 40,
  },

  // Message section
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // Button
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  createAccountButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  createAccountButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
