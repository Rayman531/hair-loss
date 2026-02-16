import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import React, { useState } from 'react';

import { Angle, ALL_ANGLES, uploadProgressSession } from '@/lib/api/progress';
import type { CapturedPhoto } from '@/lib/api/progress';
import { useProgressSession } from './_context';

type AngleConfig = {
  label: string;
  subtitle: string;
};

const ANGLE_CONFIG: Record<Angle, AngleConfig> = {
  front: { label: 'Front', subtitle: 'Hairline' },
  top: { label: 'Top', subtitle: 'Crown' },
  right: { label: 'Right', subtitle: 'Temple' },
  left: { label: 'Left', subtitle: 'Temple' },
};

export default function SetupScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { photos, reset } = useProgressSession();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const completedCount = ALL_ANGLES.filter((a) => photos[a]).length;
  const allDone = completedCount === 4;

  const handleAnglePress = (angle: Angle) => {
    if (photos[angle]) return;

    router.push({
      pathname: '/dashboard/progress/camera',
      params: { angle },
    });
  };

  const handleUploadAll = async () => {
    if (!allDone || !user?.id || uploading) return;

    setUploading(true);
    setUploadError(null);
    console.log('[Setup] Starting upload, photos:', Object.keys(photos));
    try {
      const result = await uploadProgressSession(
        user.id,
        photos as Record<Angle, CapturedPhoto>,
      );

      console.log('[Setup] Upload result:', JSON.stringify(result));
      if (result.success) {
        reset();
        router.replace('/dashboard/progress/gallery');
      } else {
        const msg = result.error?.message ?? 'Upload failed. Please try again.';
        console.error('[Setup] Upload failed:', msg);
        setUploadError(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error('[Setup] Upload error:', msg);
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>
        Setup your Progress Tracker{'\n'}by taking baseline photos
      </Text>
      <Text style={styles.subheading}>
        These will serve as a reference as you{'\n'}progress with your hair loss journey
      </Text>

      <View style={styles.anglesList}>
        {ALL_ANGLES.map((angle) => {
          const config = ANGLE_CONFIG[angle];
          const photo = photos[angle];
          const done = !!photo;

          return (
            <Pressable
              key={angle}
              style={[styles.angleCard, done && styles.angleCardDone]}
              onPress={() => handleAnglePress(angle)}
            >
              <View style={styles.angleTextCol}>
                <Text style={[styles.angleLabel, done && styles.angleLabelDone]}>
                  {config.label} ({config.subtitle})
                </Text>
                {done && <Text style={styles.checkmark}>Completed</Text>}
              </View>

              {done && photo ? (
                <Image source={{ uri: photo.uri }} style={styles.angleThumbnail} />
              ) : (
                <View style={styles.anglePlaceholder}>
                  <Text style={styles.placeholderText}>
                    {angle === 'front' ? '🧑' : angle === 'top' ? '🔝' : angle === 'right' ? '➡️' : '⬅️'}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.progressText}>
        {completedCount}/4 photos captured
      </Text>

      {uploadError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{uploadError}</Text>
          <Pressable onPress={() => setUploadError(null)}>
            <Text style={styles.errorDismiss}>Dismiss</Text>
          </Pressable>
        </View>
      )}

      {allDone && (
        <Pressable
          style={[styles.continueButton, uploading && styles.continueButtonDisabled]}
          onPress={handleUploadAll}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <Text style={styles.continueButtonText}>Continue to Gallery</Text>
          )}
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    lineHeight: 32,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 32,
  },
  anglesList: {
    gap: 14,
  },
  angleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFF8E7',
  },
  angleCardDone: {
    backgroundColor: '#EDEDED',
    opacity: 0.6,
  },
  angleTextCol: {
    flex: 1,
  },
  angleLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  angleLabelDone: {
    color: '#999',
  },
  checkmark: {
    fontSize: 13,
    color: '#81C784',
    marginTop: 4,
    fontWeight: '600',
  },
  angleThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginLeft: 12,
  },
  anglePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  placeholderText: {
    fontSize: 28,
  },
  progressText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  errorBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFD0D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#C62828',
  },
  errorDismiss: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C62828',
    marginLeft: 12,
  },
  continueButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#F5D76E',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
});
