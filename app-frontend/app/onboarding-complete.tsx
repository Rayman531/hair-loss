import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React from 'react';

export default function OnboardingCompleteScreen() {
  const router = useRouter();

  const handleCreateAccount = () => {
    router.push('/sign-up');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        {/* Crown mascot with checkmark shield */}
        <View style={styles.mascotSection}>
          <View style={styles.crownContainer}>
            {/* Crown peaks */}
            <View style={styles.crownPeaks}>
              <View style={styles.peak} />
              <View style={styles.peak} />
              <View style={styles.peak} />
            </View>

            {/* Crown body */}
            <View style={styles.crownBody}>
              <View style={styles.face}>
                <Text style={styles.eyes}>˘   ˘</Text>
                <Text style={styles.smile}>⌣</Text>
              </View>
            </View>

            {/* Blue shield with checkmark overlay */}
            <View style={styles.shieldContainer}>
              <View style={styles.shield}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            </View>
          </View>
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
    backgroundColor: '#FFFFFF',
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
  crownContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  crownPeaks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: -8,
  },
  peak: {
    width: 24,
    height: 24,
    backgroundColor: '#F5F1E8',
    borderWidth: 2,
    borderColor: '#A89B8C',
    borderRadius: 12,
    transform: [{ rotate: '45deg' }],
  },
  crownBody: {
    width: 130,
    height: 130,
    backgroundColor: '#F5F1E8',
    borderWidth: 3,
    borderColor: '#A89B8C',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyes: {
    fontSize: 32,
    color: '#A89B8C',
    letterSpacing: 8,
    marginBottom: 8,
  },
  smile: {
    fontSize: 28,
    color: '#A89B8C',
  },

  // Shield overlay
  shieldContainer: {
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  shield: {
    width: 48,
    height: 48,
    backgroundColor: '#5B9FD7',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  checkmark: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Message section
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  subtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // Button
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  createAccountButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 28,
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
