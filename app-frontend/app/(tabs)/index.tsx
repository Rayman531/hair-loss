import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text, Pressable } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';

// Replace this with your deployed Cloudflare Worker URL
// For local development: 'http://localhost:8787'
// For production: 'https://your-worker.your-subdomain.workers.dev'
const API_URL = 'http://localhost:8787';

export default function HomeScreen() {
  const [message, setMessage] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.text())
      .then((data) => {
        setMessage(data);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to fetch from backend');
        setMessage('Error');
        console.error('Error fetching from backend:', err);
      });
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{message}</ThemedText>
        <HelloWave />
      </ThemedView>
      {error && (
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="defaultSemiBold" style={{ color: 'red' }}>
            {error}
          </ThemedText>
        </ThemedView>
      )}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn absolutely nothing about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>

      {/* Dev Navigation Menu - only visible in development */}
      {__DEV__ && (
        <View style={styles.devMenu}>
          <Text style={styles.devTitle}>Dev Navigation</Text>
          <Link href="/onboarding" style={styles.devLink}>
            <Text style={styles.devLinkText}>→ Onboarding</Text>
          </Link>
          <Link href="/onboarding-complete" style={styles.devLink}>
            <Text style={styles.devLinkText}>→ Onboarding Complete</Text>
          </Link>
          <Link href="/sign-up" style={styles.devLink}>
            <Text style={styles.devLinkText}>→ Sign Up</Text>
          </Link>
          <Link href="/routine-tracker-setup" style={styles.devLink}>
            <Text style={styles.devLinkText}>→ Routine Tracker Setup</Text>
          </Link>
          <Link href="/" style={styles.devLink}>
            <Text style={styles.devLinkText}>→ Welcome (Index)</Text>
          </Link>
          <Pressable onPress={() => signOut()} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  devMenu: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  devTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#856404',
  },
  devLink: {
    paddingVertical: 8,
  },
  devLinkText: {
    color: '#856404',
    fontSize: 14,
  },
  signOutBtn: {
    marginTop: 15,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
