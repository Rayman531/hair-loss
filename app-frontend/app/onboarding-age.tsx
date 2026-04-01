import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useCallback } from 'react';
import React from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { CrownMascot } from '@/components/CrownMascot';
import { OnboardingProgressBar } from '@/components/OnboardingProgressBar';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const MIN_AGE = 18;
const MAX_AGE = 63;
const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);
const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

function AgeItem({ age, index, scrollY }: { age: number; index: number; scrollY: Animated.SharedValue<number> }) {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme];

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 2) * ITEM_HEIGHT,
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
      (index + 2) * ITEM_HEIGHT,
    ];

    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.7, 0.85, 1, 0.85, 0.7],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.25, 0.5, 1, 0.5, 0.25],
      Extrapolation.CLAMP
    );

    const rotateX = interpolate(
      scrollY.value,
      inputRange,
      [45, 20, 0, -20, -45],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { perspective: 500 }, { rotateX: `${rotateX}deg` }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.ageItem, animatedStyle]}>
      <Text style={[styles.ageText, { color: colors.text }]}>{age}</Text>
    </Animated.View>
  );
}

export default function OnboardingAgeScreen() {
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [selectedAge, setSelectedAge] = useState(25);
  const scrollY = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleMomentumEnd = useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, AGES.length - 1));
    setSelectedAge(AGES[clampedIndex]);
  }, []);

  const handleContinue = () => {
    router.push('/onboarding');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>
            Onboarding
          </Text>
          <View style={styles.progressBarContainer}>
            <OnboardingProgressBar current={1} total={14} />
          </View>
        </View>

        {/* Question */}
        <View style={styles.questionSection}>
          <Text style={[styles.questionText, { color: colors.text }]}>
            How old are you?
          </Text>
        </View>

        {/* Scroll Wheel */}
        <View style={styles.wheelContainer}>
          {/* Selection highlight */}
          <View
            style={[
              styles.selectionHighlight,
              {
                backgroundColor: colors.accent,
                top: PADDING,
              },
            ]}
          />

          <Animated.ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleMomentumEnd}
            contentContainerStyle={{
              paddingTop: PADDING,
              paddingBottom: PADDING,
            }}
            contentOffset={{ x: 0, y: (25 - MIN_AGE) * ITEM_HEIGHT }}
          >
            {AGES.map((age, index) => (
              <AgeItem key={age} age={age} index={index} scrollY={scrollY} />
            ))}
          </Animated.ScrollView>

          {/* Fade overlays */}
          <View
            style={[
              styles.fadeTop,
              {
                backgroundColor: colors.background,
              },
            ]}
            pointerEvents="none"
          />
          <View
            style={[
              styles.fadeBottom,
              {
                backgroundColor: colors.background,
              },
            ]}
            pointerEvents="none"
          />
        </View>

        {/* Note with Crown Logo */}
        <View style={[styles.noteContainer, { backgroundColor: colors.backgroundTertiary, borderColor: colors.borderLight }]}>
          <View style={styles.noteIconContainer}>
            <CrownMascot state="neutral" size={40} />
          </View>
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            Hair loss can occur at any age, knowing your age helps us understand your stage.
          </Text>
        </View>
      </View>

      {/* Continue button */}
      <View style={[styles.buttonContainer, { backgroundColor: colors.background, borderTopColor: colors.divider, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.accent }]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '400',
  },
  progressBarContainer: {
    marginTop: 12,
    width: '100%',
  },

  // Question
  questionSection: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'left',
    lineHeight: 30,
  },

  // Scroll wheel
  wheelContainer: {
    height: WHEEL_HEIGHT,
    alignSelf: 'center',
    width: 160,
    marginTop: 24,
    overflow: 'hidden',
  },
  selectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 14,
    zIndex: 0,
  },
  ageItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageText: {
    fontSize: 28,
    fontWeight: '600',
  },

  // Fade overlays
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.5,
    opacity: 0.7,
    pointerEvents: 'none',
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.5,
    opacity: 0.7,
    pointerEvents: 'none',
  },

  // Note
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  noteIconContainer: {
    flexShrink: 0,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },

  // Continue button
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  continueButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
