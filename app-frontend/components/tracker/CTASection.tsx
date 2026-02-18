import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CTASectionProps {
  onPress: () => void;
}

export default function CTASection({ onPress }: CTASectionProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Log Side Effects This Week</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  button: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
