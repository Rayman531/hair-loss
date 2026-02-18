import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import React from 'react';

// DEV ONLY: Set to a route like '/onboarding' to skip auth and go directly there
// Set to null for normal behavior
// Examples: '/onboarding', '/sign-up', '/onboarding-complete', '/routine-tracker-setup'
const DEV_INITIAL_ROUTE: string | null = null;

export default function WelcomeScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    // Dev override: skip auth check and go directly to specified route
    if (__DEV__ && DEV_INITIAL_ROUTE) {
      router.replace(DEV_INITIAL_ROUTE);
      return;
    }
    if (isLoaded && isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn]);

  const handleContinue = () => {
    router.push('/onboarding');
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  // If signed in, show loading while redirecting
  if (isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

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

          <TouchableOpacity
            style={styles.signInButton}
            activeOpacity={0.8}
            onPress={handleSignIn}
          >
            <Text style={styles.signInButtonText}>Already have an account? Sign In</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  signInButton: {
    marginTop: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '500',
  },
});
