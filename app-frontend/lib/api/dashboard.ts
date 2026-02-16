import { API_BASE_URL } from "@/constants/api";

export async function fetchDashboard(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    headers: { "X-User-Id": userId },
  });

  if (!response.ok) {
    throw new Error(`Dashboard request failed (${response.status})`);
  }

  return response.json();
}
