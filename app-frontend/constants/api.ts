import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Get the correct API base URL for the current platform
 *
 * - iOS Simulator: localhost works
 * - Android Emulator: Use 10.0.2.2 (special alias for host machine)
 * - Physical Device: Use your machine's local IP address
 */
function getApiBaseUrl(): string {
  // For development, we need different URLs based on platform
  const DEV_PORT = '8787';

  if (__DEV__) {
    // Android emulator uses special IP to access host machine
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${DEV_PORT}`;
    }

    // iOS simulator and Expo Go can use localhost
    if (Platform.OS === 'ios') {
      return `http://localhost:${DEV_PORT}`;
    }

    // For physical devices or if above don't work, use the Expo manifest host IP
    // This gets the IP of the machine running the Expo dev server
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      const host = debuggerHost.split(':')[0];
      return `http://${host}:${DEV_PORT}`;
    }

    // Fallback (won't work on real devices)
    return `http://localhost:${DEV_PORT}`;
  }

  // Production URL (replace with your actual production API URL)
  return 'https://your-production-api.com';
}

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  ONBOARDING_QUESTIONS: `${API_BASE_URL}/api/onboarding/questions`,
  ONBOARDING_RESPONSES: `${API_BASE_URL}/api/onboarding/responses`,
  ROUTINE: `${API_BASE_URL}/api/routine`,
  ROUTINE_EXISTS: `${API_BASE_URL}/api/routine/exists`,
};
