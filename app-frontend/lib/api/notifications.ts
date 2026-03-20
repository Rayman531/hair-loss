import { API_ENDPOINTS } from '@/constants/api';

export type NotificationPreferences = {
  enabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  timezone: string;
};

export async function registerPushToken(userId: string, token: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_PUSH_TOKEN, {
    method: 'POST',
    headers: {
      'X-User-Id': userId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  return response.json();
}

export async function unregisterPushToken(userId: string, token: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_PUSH_TOKEN, {
    method: 'DELETE',
    headers: {
      'X-User-Id': userId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  return response.json();
}

export async function fetchNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_PREFERENCES, {
    headers: { 'X-User-Id': userId },
  });

  const json = await response.json();
  return json.data;
}

export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferences>,
): Promise<{ success: boolean }> {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_PREFERENCES, {
    method: 'PUT',
    headers: {
      'X-User-Id': userId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prefs),
  });

  return response.json();
}
