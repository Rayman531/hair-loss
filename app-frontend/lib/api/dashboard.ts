import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";

export type TrackerTreatment = {
  id: string;
  routineId: string;
  name: string;
  frequencyPerWeek: number;
};

export type TreatmentLog = {
  id: string;
  treatmentId: string;
  date: string;
  completed: boolean;
  treatmentName: string;
};

export async function fetchDashboard(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    headers: { "X-User-Id": userId },
  });

  if (!response.ok) {
    throw new Error(`Dashboard request failed (${response.status})`);
  }

  return response.json();
}

export async function fetchTrackerTreatments(userId: string): Promise<TrackerTreatment[]> {
  const response = await fetch(API_ENDPOINTS.TRACKER_TREATMENTS, {
    headers: { "X-User-Id": userId },
  });

  if (!response.ok) return [];

  const json = await response.json();
  return json.success ? json.data : [];
}

export async function fetchTodayLogs(userId: string, month: string): Promise<TreatmentLog[]> {
  const response = await fetch(`${API_ENDPOINTS.TRACKER_TREATMENT_LOGS}?month=${month}`, {
    headers: { "X-User-Id": userId },
  });

  if (!response.ok) return [];

  const json = await response.json();
  return json.success ? json.data : [];
}

export async function toggleTreatmentLog(
  userId: string,
  treatmentId: string,
  date: string,
  completed: boolean,
): Promise<{ success: boolean }> {
  const response = await fetch(API_ENDPOINTS.TRACKER_TREATMENT_LOGS, {
    method: "POST",
    headers: {
      "X-User-Id": userId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ treatmentId, date, completed }),
  });

  return response.json();
}
