import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';

import { fetchProgressSessions } from '@/lib/api/progress';
import { ThemedText } from '@/components/themed-text';

export default function ProgressIndex() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetchProgressSessions(token);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          router.replace('/dashboard/progress/gallery');
        } else {
          router.replace('/dashboard/progress/setup');
        }
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, []);

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
