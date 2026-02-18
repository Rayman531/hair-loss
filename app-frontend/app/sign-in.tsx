import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import React from 'react';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
        strategy: 'password',
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else if (result.status === 'needs_first_factor') {
        // Attempt password as first factor
        const firstFactor = await signIn.attemptFirstFactor({
          strategy: 'password',
          password,
        });

        if (firstFactor.status === 'complete') {
          await setActive({ session: firstFactor.createdSessionId });
          router.replace('/(tabs)');
        } else {
          setError('Sign in could not be completed. Please try again.');
        }
      } else {
        setError('Sign in could not be completed. Please try again.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.errors?.[0]?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subtext}>
              Sign in to continue your hair care journey
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSignInPress}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  content: {
    flex: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonDisabled: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
