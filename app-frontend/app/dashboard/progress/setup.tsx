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
import React, { useState, useMemo } from 'react';

import { Angle, ALL_ANGLES, uploadProgressSession } from '@/lib/api/progress';
import type { CapturedPhoto } from '@/lib/api/progress';
import { useProgressSession } from './_context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { FrontViewIcon } from '@/components/icons/FrontViewIcon';
import { TopViewIcon } from '@/components/icons/TopViewIcon';
import { RightViewIcon } from '@/components/icons/RightViewIcon';
import { LeftViewIcon } from '@/components/icons/LeftViewIcon';

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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const themed = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    heading: { color: colors.text },
    subheading: { color: colors.textTertiary },
    angleCard: { backgroundColor: colors.accentBackground },
    angleCardDone: { backgroundColor: colors.backgroundTertiary },
    angleLabel: { color: colors.text },
    angleLabelDone: { color: colors.textTertiary },
    placeholderBg: { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)' },
    progressText: { color: colors.textTertiary },
    errorBox: { backgroundColor: colors.errorBackground, borderColor: colors.errorBorder },
    errorText: { color: colors.error },
    continueButton: { backgroundColor: colors.accent },
  }), [colors, colorScheme]);

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
    <ScrollView style={[styles.screen, themed.screen]} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, themed.heading]}>
        Setup your Progress Tracker{'\n'}by taking baseline photos
      </Text>
      <Text style={[styles.subheading, themed.subheading]}>
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
              style={[styles.angleCard, themed.angleCard, done && [styles.angleCardDone, themed.angleCardDone]]}
              onPress={() => handleAnglePress(angle)}
            >
              <View style={styles.angleTextCol}>
                <Text style={[styles.angleLabel, themed.angleLabel, done && [styles.angleLabelDone, themed.angleLabelDone]]}>
                  {config.label} ({config.subtitle})
                </Text>
                {done && <Text style={styles.checkmark}>Completed</Text>}
              </View>

              {done && photo ? (
                <Image source={{ uri: photo.uri }} style={styles.angleThumbnail} />
              ) : (
                <View style={[styles.anglePlaceholder, themed.placeholderBg]}>
                  {angle === 'front' && <FrontViewIcon size={52} color={colors.textSecondary} />}
                  {angle === 'top' && <TopViewIcon size={52} color={colors.textSecondary} />}
                  {angle === 'right' && <RightViewIcon size={52} color={colors.textSecondary} />}
                  {angle === 'left' && <LeftViewIcon size={52} color={colors.textSecondary} />}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.progressText, themed.progressText]}>
        {completedCount}/4 photos captured
      </Text>

      {uploadError && (
        <View style={[styles.errorBox, themed.errorBox]}>
          <Text style={[styles.errorText, themed.errorText]}>{uploadError}</Text>
          <Pressable onPress={() => setUploadError(null)}>
            <Text style={[styles.errorDismiss, themed.errorText]}>Dismiss</Text>
          </Pressable>
        </View>
      )}

      {allDone && (
        <Pressable
          style={[styles.continueButton, themed.continueButton, uploading && styles.continueButtonDisabled]}
          onPress={handleUploadAll}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
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
  },
  content: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 14,
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
  },
  angleCardDone: {
    opacity: 0.6,
  },
  angleTextCol: {
    flex: 1,
  },
  angleLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  angleLabelDone: {},
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
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  placeholderText: {
    fontSize: 28,
  },
  progressText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
  errorBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
  errorDismiss: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
  },
  continueButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
