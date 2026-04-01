import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import React from 'react';
import { useRouter } from 'expo-router';
import { API_ENDPOINTS, API_BASE_URL } from '../constants/api';
import { CrownMascot } from '@/components/CrownMascot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { OnboardingProgressBar } from '@/components/OnboardingProgressBar';

// Types matching backend API
interface QuestionOption {
  id: number;
  text: string;
  order: number;
}

interface Question {
  id: number;
  question: string;
  order: number;
  options: QuestionOption[];
}

interface ApiResponse {
  success: boolean;
  data: Question[];
}

// Buffer pages shown after specific question indices (0-indexed)
const BUFFER_PAGES: Record<number, string> = {
  3: 'Follix helps you take control. Track your progress, stay consistent, and reduce the stress of hair loss over time.',
  6: 'Early action makes a difference. The sooner you start, the more you can protect.',
  9: 'We break down your options clearly, so you can choose confidently and stay consistent.',
};

const TOTAL_ONBOARDING_STEPS = 14; // 1 age + 10 questions + 3 buffers

function getProgressStep(questionIndex: number, showingBuffer: boolean): number {
  const buffersPassed = questionIndex <= 3 ? 0 : questionIndex <= 6 ? 1 : 2;
  const base = questionIndex + 2 + buffersPassed;
  return showingBuffer ? base + 1 : base;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [showingBuffer, setShowingBuffer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  // Floating animation for buffer pages
  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withRepeat(
      withTiming(-12, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  // Fetch questions on mount
  useEffect(() => {
    console.log('API Base URL:', API_BASE_URL);
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      // Debug: Log the API URL being used
      console.log('Fetching from:', API_ENDPOINTS.ONBOARDING_QUESTIONS);

      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(API_ENDPOINTS.ONBOARDING_QUESTIONS, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data: ApiResponse = await response.json();

      if (data.success) {
        setQuestions(data.data);
      } else {
        setError('Failed to load questions');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timeout. Please check your connection.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionId: number) => {
    setSelectedOptionId(optionId);
  };

  const handleContinue = () => {
    // If showing a buffer page, dismiss it and advance
    if (showingBuffer) {
      setShowingBuffer(false);
      if (currentQuestionIndex === questions.length - 1) {
        router.push('/onboarding-complete');
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOptionId(null);
      }
      return;
    }

    if (selectedOptionId === null) return;

    // Check if a buffer page should appear after this question
    if (BUFFER_PAGES[currentQuestionIndex] !== undefined) {
      setShowingBuffer(true);
      return;
    }

    // Check if this is the last question
    if (currentQuestionIndex === questions.length - 1) {
      router.push('/onboarding-complete');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error || 'No questions available'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isContinueDisabled = !showingBuffer && selectedOptionId === null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {showingBuffer ? (
        /* ── Buffer / motivational page ── */
        <View style={styles.bufferContent}>
          {/* Progress bar pinned at top */}
          <View style={[styles.bufferProgressBar, { paddingHorizontal: 24 }]}>
            <View style={styles.progressBarContainer}>
              <OnboardingProgressBar current={getProgressStep(currentQuestionIndex, showingBuffer)} total={TOTAL_ONBOARDING_STEPS} />
            </View>
          </View>

          {/* Crown logo + text vertically centered */}
          <View style={styles.bufferCenterGroup}>
            <View style={styles.bufferMascotSection}>
              <Animated.View style={floatingStyle}>
                <CrownMascot state="encouraging" size={160} />
              </Animated.View>
            </View>

            <View style={styles.bufferTextSection}>
              <Text style={[styles.bufferText, { color: colors.text }]}>
                {BUFFER_PAGES[currentQuestionIndex]}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        /* ── Question page ── */
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header with progress indicator */}
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: colors.textSecondary }]}>
              Onboarding Question
            </Text>
            <View style={styles.progressBarContainer}>
              <OnboardingProgressBar current={getProgressStep(currentQuestionIndex, showingBuffer)} total={TOTAL_ONBOARDING_STEPS} />
            </View>
          </View>

          {/* Crown mascot — encouraging when an option is selected */}
          <View style={styles.mascotSection}>
            <CrownMascot
              state={selectedOptionId !== null ? 'encouraging' : 'neutral'}
              size={110}
            />
          </View>

          {/* Question */}
          <View style={styles.questionSection}>
            <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion.question}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsSection}>
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.backgroundTertiary },
                    isSelected && { backgroundColor: colors.accent },
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    { color: colors.text },
                    isSelected && styles.optionTextSelected,
                  ]}>
                    {option.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Continue button - fixed at bottom */}
      <View style={[styles.buttonContainer, { backgroundColor: colors.background, borderTopColor: colors.divider, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.accent },
            isContinueDisabled && { backgroundColor: colors.switchTrackOff },
          ]}
          onPress={handleContinue}
          disabled={isContinueDisabled}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.continueButtonText,
            isContinueDisabled && { color: colors.textTertiary },
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Space for fixed button
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Mascot
  mascotSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },

  // Question
  questionSection: {
    paddingVertical: 20,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'left',
    lineHeight: 30,
  },

  // Options
  optionsSection: {
    gap: 12,
    paddingTop: 10,
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    minHeight: 56,
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#FFFFFF',
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

  // Buffer pages
  bufferContent: {
    flex: 1,
  },
  bufferProgressBar: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  bufferCenterGroup: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferMascotSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bufferTextSection: {
    paddingHorizontal: 32,
  },
  bufferText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 30,
  },

  // Error
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
