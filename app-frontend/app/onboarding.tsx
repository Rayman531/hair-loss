import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'expo-router';
import { API_ENDPOINTS, API_BASE_URL } from '../constants/api';
import { CrownMascot } from '@/components/CrownMascot';

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

        {/* Crown mascot — encouraging when an option is selected */}
        <View style={styles.mascotSection}>
          <CrownMascot
            state={selectedOptionId !== null ? 'encouraging' : 'neutral'}
            size={110}
          />
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
    backgroundColor: '#F8F8F8',
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
    color: '#636366',
    fontWeight: '400',
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
    color: '#1C1C1E',
    textAlign: 'left',
    lineHeight: 30,
  },

  // Options
  optionsSection: {
    gap: 12,
    paddingTop: 10,
  },
  optionButton: {
    backgroundColor: '#EEEEEE',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    minHeight: 56,
    justifyContent: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#C4A882',
  },
  optionText: {
    fontSize: 16,
    color: '#1C1C1E',
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
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  continueButton: {
    backgroundColor: '#C4A882',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  continueButtonDisabled: {
    backgroundColor: '#DDDDDD',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#8E8E93',
  },

  // Error
  errorText: {
    fontSize: 16,
    color: '#636366',
    textAlign: 'center',
  },
});
