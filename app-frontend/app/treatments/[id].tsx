import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { getTreatmentById, TreatmentRating } from '@/lib/treatments';

function RatingBar({ rating, dark }: { rating: TreatmentRating; dark: boolean }) {
  const fraction = rating.numericValue / rating.maxValue;
  const barColor = '#D4C4A0';

  return (
    <View style={ratingStyles.container}>
      <View style={ratingStyles.labelRow}>
        <Text style={[ratingStyles.label, { color: dark ? '#ECEDEE' : '#1A1A1A' }]}>
          {rating.label}
        </Text>
        <Text style={[ratingStyles.value, { color: dark ? '#9BA1A6' : '#666' }]}>
          {rating.value}
        </Text>
      </View>
      <View style={[ratingStyles.track, { backgroundColor: dark ? '#2A2A2A' : '#E8E8E8' }]}>
        <View
          style={[
            ratingStyles.fill,
            { width: `${fraction * 100}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default function TreatmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];

  const treatment = getTreatmentById(id);

  const themed = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    title: { color: dark ? '#ECEDEE' : '#1A1A1A' },
    subtitle: { color: dark ? '#9BA1A6' : '#666' },
    sectionTitle: { color: dark ? '#ECEDEE' : '#1A1A1A' },
    paragraph: { color: dark ? '#C8C8C8' : '#444' },
    card: { backgroundColor: dark ? '#1E2022' : '#F8F8F8' },
    backText: { color: dark ? '#ECEDEE' : '#1A1A1A' },
    bestSuitedCard: {
      backgroundColor: dark ? '#1E2A1E' : '#F1F8E9',
      borderColor: dark ? '#2E7D32' : '#C5E1A5',
    },
    bestSuitedLabel: { color: dark ? '#81C784' : '#33691E' },
    bestSuitedText: { color: dark ? '#C8C8C8' : '#444' },
  }), [dark, colors]);

  if (!treatment) {
    return (
      <SafeAreaView style={[styles.screen, themed.screen]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, themed.title]}>Treatment not found.</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={themed.backText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, themed.screen]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backArrow, themed.backText]}>{'\u2039'}</Text>
          <Text style={[styles.backLabel, themed.backText]}>Back</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={[styles.title, themed.title]}>{treatment.name}</Text>
        <Text style={[styles.subtitle, themed.subtitle]}>{treatment.subtitle}</Text>

        {/* Ratings */}
        <View style={[styles.card, themed.card]}>
          <Text style={[styles.sectionTitle, themed.sectionTitle]}>Ratings</Text>
          {treatment.ratings.map((rating) => (
            <RatingBar key={rating.label} rating={rating} dark={dark} />
          ))}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themed.sectionTitle]}>Overview</Text>
          {treatment.description.map((paragraph, i) => (
            <Text key={i} style={[styles.paragraph, themed.paragraph]}>
              {paragraph}
            </Text>
          ))}
        </View>

        {/* Best Suited For */}
        <View style={[styles.bestSuitedCard, themed.bestSuitedCard]}>
          <Text style={[styles.bestSuitedLabel, themed.bestSuitedLabel]}>
            Best suited for
          </Text>
          <Text style={[styles.bestSuitedText, themed.bestSuitedText]}>
            {treatment.bestSuitedFor}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 28,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 14,
  },
  bestSuitedCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  bestSuitedLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  bestSuitedText: {
    fontSize: 15,
    lineHeight: 23,
  },
});
