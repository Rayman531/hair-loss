import { API_ENDPOINTS } from "@/constants/api";

export type Angle = "front" | "top" | "right" | "left";

export const ALL_ANGLES: Angle[] = ["front", "top", "right", "left"];

export type ProgressSession = {
  id: string;
  token: string;
  note: string | null;
  frontImageUrl: string;
  topImageUrl: string;
  rightImageUrl: string;
  leftImageUrl: string;
  createdAt: string;
};

export type CapturedPhoto = {
  uri: string;
  note?: string;
};

export async function uploadProgressSession(
  token: string,
  photos: Record<Angle, CapturedPhoto>,
): Promise<{ success: boolean; data?: ProgressSession; error?: { message: string } }> {
  const formData = new FormData();

  const notes: string[] = [];
  for (const angle of ALL_ANGLES) {
    const photo = photos[angle];
    formData.append(angle, {
      uri: photo.uri,
      name: `${angle}.jpg`,
      type: 'image/jpeg',
    } as any);

    if (photo.note) {
      notes.push(`${angle}: ${photo.note}`);
    }
  }

  if (notes.length > 0) {
    formData.append('note', notes.join('; '));
  }

  console.log(`[Progress] Uploading session`);

  const response = await fetch(API_ENDPOINTS.PROGRESS_UPLOAD, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  console.log(`[Progress] Upload response: ${response.status}`);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error?.message ?? `Upload failed (${response.status})`,
    );
  }

  return response.json();
}

export async function fetchProgressSessions(token: string): Promise<{
  success: boolean;
  data?: ProgressSession[];
  error?: { message: string };
}> {
  const response = await fetch(API_ENDPOINTS.PROGRESS, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Progress request failed (${response.status})`);
  }

  return response.json();
}

export async function deleteProgressSession(
  token: string,
  sessionId: string,
): Promise<{ success: boolean; error?: { message: string } }> {
  const response = await fetch(`${API_ENDPOINTS.PROGRESS}/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error?.message ?? `Delete failed (${response.status})`,
    );
  }

  return response.json();
}
