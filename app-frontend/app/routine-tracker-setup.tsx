import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

interface RoutineTrackerSetupProps {
  onContinue: () => void;
}

export default function RoutineTrackerSetupScreen({ onContinue }: RoutineTrackerSetupProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Routine Tracker - Setup</Text>
      </View>

      <View style={styles.content}>
        {/* Card */}
        <View style={styles.card}>
          {/* Headline */}
          <Text style={styles.headline}>
            Let's set up{'\n'}your routine{'\n'}tracker
          </Text>

          {/* Supporting text */}
          <Text style={styles.supportingText}>
            Your routine tracker ensures you stay consistent with your treatments ensuring maximum results!
          </Text>

          {/* Crown Mascot Placeholder */}
          <View style={styles.illustrationContainer}>
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
            </View>
          </View>
        </View>
      </View>

      {/* Continue Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'left',
    alignSelf: 'flex-start',
    lineHeight: 40,
    marginBottom: 16,
  },
  supportingText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    textAlign: 'left',
    alignSelf: 'flex-start',
    lineHeight: 22,
    marginBottom: 40,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownContainer: {
    alignItems: 'center',
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
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
