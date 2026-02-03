import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React from 'react';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.heading}>Welcome to{'\n'}Follix!</Text>
          <Text style={styles.subtitle}>
            Let's take a few minutes to get you setup, we'll be asking you a few questions to get a better idea of your hair loss journey
          </Text>
        </View>

        {/* Crown Mascot */}
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
              {/* Face */}
              <View style={styles.face}>
                <Text style={styles.eyes}>˘   ˘</Text>
                <Text style={styles.smile}>⌣</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Button Section */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  heading: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },

  // Mascot Section
  mascotSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
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

  // Button Section
  buttonSection: {
    paddingTop: 20,
  },
  button: {
    backgroundColor: '#000000',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
