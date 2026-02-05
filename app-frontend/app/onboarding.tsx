import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'expo-router';
import { API_ENDPOINTS, API_BASE_URL } from '../constants/api';

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

export default function OnboardingScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (selectedOptionId === null) return;

    // Check if this is the last question
    if (currentQuestionIndex === questions.length - 1) {
      // Navigate to onboarding complete screen
      router.push('/onboarding-complete');
    } else {
      // Advance to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionId(null); // Reset selection for next question
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'No questions available'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isContinueDisabled = selectedOptionId === null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with progress indicator */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Onboarding Question
          </Text>
        </View>

        {/* Crown mascot */}
        <View style={styles.mascotSection}>
          <View style={styles.crownContainer}>
            {/* Crown peaks */}
            <View style={styles.crownPeaks}>
              <View style={styles.peak} />
              <View style={styles.peak} />
              <View style={styles.peak} />
            </View>

            {/* Crown body */}
            <View style={styles.crownBody}>
              <View style={styles.face}>
                <Text style={styles.eyes}>˘   ˘</Text>
                <Text style={styles.smile}>⌣</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Question */}
        <View style={styles.questionSection}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
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
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => handleOptionSelect(option.id)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}>
                  {option.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue button - fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isContinueDisabled && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={isContinueDisabled}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.continueButtonText,
            isContinueDisabled && styles.continueButtonTextDisabled,
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
    backgroundColor: '#FAFAF8',
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
    color: '#666666',
    fontWeight: '400',
  },

  // Mascot
  mascotSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  crownContainer: {
    alignItems: 'center',
  },
  crownPeaks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: -8,
  },
  peak: {
    width: 24,
    height: 24,
    backgroundColor: '#F5F1E8',
    borderWidth: 2,
    borderColor: '#A89B8C',
    borderRadius: 12,
    transform: [{ rotate: '45deg' }],
  },
  crownBody: {
    width: 130,
    height: 130,
    backgroundColor: '#F5F1E8',
    borderWidth: 3,
    borderColor: '#A89B8C',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyes: {
    fontSize: 32,
    color: '#A89B8C',
    letterSpacing: 8,
    marginBottom: 8,
  },
  smile: {
    fontSize: 28,
    color: '#A89B8C',
  },

  // Question
  questionSection: {
    paddingVertical: 20,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'left',
    lineHeight: 30,
  },

  // Options
  optionsSection: {
    gap: 12,
    paddingTop: 10,
  },
  optionButton: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#4A4A4A',
  },
  optionText: {
    fontSize: 16,
    color: '#1A1A1A',
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
    backgroundColor: '#FAFAF8',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  continueButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  continueButtonDisabled: {
    backgroundColor: '#D0D0D0',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#999999',
  },

  // Error
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});
