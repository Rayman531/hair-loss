import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import GalleryScreen from '@/app/dashboard/progress/gallery';
import { screen } from '@/lib/analytics';

export default function GalleryTab() {
  useFocusEffect(useCallback(() => { screen('Progress Gallery'); }, []));
  return <GalleryScreen />;
}
