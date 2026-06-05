import { API_ENDPOINTS } from '@/constants/api';

export type NotificationPreferences = {
  enabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  timezone: string;
};

export async function registerPushToken(authToken: string, pushToken: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_PUSH_TOKEN, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: pushToken }),
  });

  return response.json();
}

export async function unregisterPushToken(authToken: string, pushToken: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_PUSH_TOKEN, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: pushToken }),
  });

  return response.json();
}

export async function fetchNotificationPreferences(token: string): Promise<NotificationPreferences> {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_PREFERENCES, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const json = await response.json();
  return json.data;
}

export async function updateNotificationPreferences(
  token: string,
  prefs: Partial<NotificationPreferences>,
): Promise<{ success: boolean }> {
  const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_PREFERENCES, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prefs),
  });

  return response.json();
}
