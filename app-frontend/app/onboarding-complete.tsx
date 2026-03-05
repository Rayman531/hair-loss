import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React from 'react';
import { CrownMascot } from '@/components/CrownMascot';

export default function OnboardingCompleteScreen() {
  const router = useRouter();

  const handleCreateAccount = () => {
    router.push('/sign-up');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        {/* Crown mascot — completion state with badge */}
        <View style={styles.mascotSection}>
          <CrownMascot state="completion" size={130} />
        </View>

        {/* Thank you message */}
        <View style={styles.messageSection}>
          <Text style={styles.heading}>
            Thank you for taking the time to answer our questions!
          </Text>

          <Text style={styles.subtext}>
            Sign up and unlock your routine and progress tracker as well as other hair loss insights based off your onboarding!
          </Text>
        </View>
      </View>

      {/* Create Account button - fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.createAccountButton}
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
    backgroundColor: '#F8F8F8',
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
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  subtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // Button
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#F8F8F8',
  },
  createAccountButton: {
    backgroundColor: '#C4A882',
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
