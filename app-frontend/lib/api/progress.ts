import { API_ENDPOINTS } from "@/constants/api";

export type Angle = "front" | "top" | "right" | "left";

export const ALL_ANGLES: Angle[] = ["front", "top", "right", "left"];

export type ProgressSession = {
  id: string;
  userId: string;
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

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

export async function uploadProgressSession(
  userId: string,
  photos: Record<Angle, CapturedPhoto>,
): Promise<{ success: boolean; data?: ProgressSession; error?: { message: string } }> {
  const formData = new FormData();

  const notes: string[] = [];
  for (const angle of ALL_ANGLES) {
    const photo = photos[angle];
    const blob = await uriToBlob(photo.uri);
    const file = new File([blob], `${angle}.jpg`, { type: 'image/jpeg' });
    formData.append(angle, file);

    if (photo.note) {
      notes.push(`${angle}: ${photo.note}`);
    }
  }

  if (notes.length > 0) {
    formData.append('note', notes.join('; '));
  }

  console.log(`[Progress] Uploading session for user ${userId} (${ALL_ANGLES.map(a => `${a}: ${formData.get(a) instanceof File}`).join(', ')})`);

  const response = await fetch(API_ENDPOINTS.PROGRESS_UPLOAD, {
    method: 'POST',
    headers: { 'X-User-Id': userId },
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

export async function fetchProgressSessions(userId: string): Promise<{
  success: boolean;
  data?: ProgressSession[];
  error?: { message: string };
}> {
  const response = await fetch(API_ENDPOINTS.PROGRESS, {
    headers: { "X-User-Id": userId },
  });

  if (!response.ok) {
    throw new Error(`Progress request failed (${response.status})`);
  }

  return response.json();
}

export async function deleteProgressSession(
  userId: string,
  sessionId: string,
): Promise<{ success: boolean; error?: { message: string } }> {
  const response = await fetch(`${API_ENDPOINTS.PROGRESS}/${sessionId}`, {
    method: 'DELETE',
    headers: { 'X-User-Id': userId },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error?.message ?? `Delete failed (${response.status})`,
    );
  }

  return response.json();
}
