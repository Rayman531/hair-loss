import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";

export type TrackerTreatment = {
  id: string;
  routineId: string;
  name: string;
  daysOfWeek: string[];
  frequencyPerWeek: number;
};

export type TreatmentLog = {
  id: string;
  treatmentId: string;
  date: string;
  completed: boolean;
  treatmentName: string;
};

export async function fetchDashboard(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Dashboard request failed (${response.status})`);
  }

  return response.json();
}

export async function fetchTrackerTreatments(token: string, day: string): Promise<TrackerTreatment[]> {
  const response = await fetch(`${API_ENDPOINTS.TRACKER_TREATMENTS}?day=${day}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (!response.ok) return [];

  const json = await response.json();
  return json.success ? json.data : [];
}

export async function fetchTodayLogs(token: string, month: string): Promise<TreatmentLog[]> {
  const response = await fetch(`${API_ENDPOINTS.TRACKER_TREATMENT_LOGS}?month=${month}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (!response.ok) return [];

  const json = await response.json();
  return json.success ? json.data : [];
}

export async function toggleTreatmentLog(
  token: string,
  treatmentId: string,
  date: string,
  completed: boolean,
): Promise<{ success: boolean }> {
  const response = await fetch(API_ENDPOINTS.TRACKER_TREATMENT_LOGS, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ treatmentId, date, completed }),
  });

  return response.json();
}
