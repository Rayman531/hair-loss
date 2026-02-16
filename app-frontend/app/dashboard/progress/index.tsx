import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';

import { fetchProgressSessions } from '@/lib/api/progress';
import { ThemedText } from '@/components/themed-text';

export default function ProgressIndex() {
  const { user } = useUser();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    fetchProgressSessions(user.id)
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          router.replace('/dashboard/progress/gallery');
        } else {
          router.replace('/dashboard/progress/setup');
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [user?.id]);

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
