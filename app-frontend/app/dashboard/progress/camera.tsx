import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';

import type { Angle } from '@/lib/api/progress';
import { useProgressSession } from './_context';

const ANGLE_LABELS: Record<string, string> = {
  front: 'Front (Hairline)',
  top: 'Top (Crown)',
  right: 'Right (Temple)',
  left: 'Left (Temple)',
};

export default function CameraScreen() {
  const router = useRouter();
  const { angle } = useLocalSearchParams<{ angle: string }>();
  const { setPhoto } = useProgressSession();

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const validAngle = angle as Angle | undefined;

  // --- Permission handling ---

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to take your progress photos.
        </Text>
        {permission.canAskAgain ? (
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        ) : (
          <Text style={styles.permissionText}>
            Please enable camera access in your device settings.
          </Text>
        )}
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // --- Capture ---

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (result?.uri) {
        setPhotoUri(result.uri);
      }
    } catch (err) {
      console.error('Failed to capture photo:', err);
    } finally {
      setCapturing(false);
    }
  };

  // --- Retake ---

  const handleRetake = () => {
    setPhotoUri(null);
    setNote('');
    setShowNoteInput(false);
  };

  // --- Upload (save locally + navigate back) ---

  const handleUpload = () => {
    if (!photoUri || !validAngle) return;

    setPhoto(validAngle, {
      uri: photoUri,
      note: note.trim() || undefined,
    });

    router.back();
  };

  // --- Review screen (after photo taken) ---

  if (photoUri) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Image source={{ uri: photoUri }} style={styles.preview} />

        <View style={styles.reviewOverlay}>
          <Text style={styles.angleTag}>
            {ANGLE_LABELS[validAngle ?? ''] ?? validAngle}
          </Text>

          {showNoteInput ? (
            <View style={styles.noteContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="e.g. wet hair, greasy, just washed..."
                placeholderTextColor="#999"
                value={note}
                onChangeText={setNote}
                maxLength={120}
                autoFocus
              />
              <Pressable
                style={styles.noteDone}
                onPress={() => setShowNoteInput(false)}
              >
                <Text style={styles.noteDoneText}>Done</Text>
              </Pressable>
            </View>
          ) : (
            note.length > 0 && (
              <Pressable onPress={() => setShowNoteInput(true)}>
                <Text style={styles.notePreview}>Note: {note}</Text>
              </Pressable>
            )
          )}

          <View style={styles.reviewButtons}>
            <Pressable style={styles.retakeButton} onPress={handleRetake}>
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>

            {!showNoteInput && (
              <Pressable
                style={styles.commentButton}
                onPress={() => setShowNoteInput(true)}
              >
                <Text style={styles.commentText}>Add Comment</Text>
              </Pressable>
            )}

            <Pressable style={styles.uploadButton} onPress={handleUpload}>
              <Text style={styles.uploadText}>Upload</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // --- Live camera preview ---

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.cameraOverlay}>
          <Text style={styles.angleTag}>
            {ANGLE_LABELS[validAngle ?? ''] ?? validAngle}
          </Text>
        </View>
      </CameraView>

      <View style={styles.controls}>
        <Pressable
          style={[styles.captureButton, capturing && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={capturing}
        >
          {capturing ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <View style={styles.captureInner} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  // Permission
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#F5D76E',
    marginBottom: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    fontSize: 14,
    color: '#888',
  },

  // Camera
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  angleTag: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  controls: {
    paddingVertical: 28,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },

  // Review
  preview: {
    flex: 1,
  },
  reviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  reviewButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  retakeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
  },
  retakeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  commentButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
  },
  commentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  uploadButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5D76E',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },

  // Note
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  noteInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 6,
  },
  noteDone: {
    paddingLeft: 12,
    paddingVertical: 6,
  },
  noteDoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5D76E',
  },
  notePreview: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.85)',
    color: '#555',
    fontSize: 13,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
