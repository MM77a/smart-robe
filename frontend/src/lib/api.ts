import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ItemUploadResponse {
  item_id: string;
  image_url: string;
  segmented_url: string | null;
  tags: string[];
}

export interface OutfitRecommendation {
  outfit_id: string;
  items: ItemUploadResponse[];
  score: number;
}

export interface TryOnResponse {
  job_id: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  result_url: string | null;
}

export interface UserProfile {
  style_answers: Record<string, string>;
  occasion_prefs: string[];
}

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Upload a wardrobe item image for a given user.
 */
export async function uploadWardrobeItem(
  userId: string,
  file: File,
): Promise<ItemUploadResponse> {
  const form = new FormData();
  form.append('user_id', userId);
  form.append('file', file);
  const { data } = await api.post<ItemUploadResponse>('/wardrobe/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * Fetch outfit recommendations for a user based on occasion and weather.
 */
export async function getRecommendations(
  userId: string,
  occasion: string,
  weather: string,
  topK = 5,
): Promise<OutfitRecommendation[]> {
  const { data } = await api.get<OutfitRecommendation[]>('/recommendation', {
    params: { user_id: userId, occasion, weather, top_k: topK },
  });
  return data;
}

/**
 * Initiate a virtual try-on job.
 */
export async function startTryOn(
  userId: string,
  outfitId: string,
  userPhotoUrl: string,
): Promise<TryOnResponse> {
  const { data } = await api.post<TryOnResponse>('/tryon', {
    user_id: userId,
    outfit_id: outfitId,
    user_photo_url: userPhotoUrl,
  });
  return data;
}

/**
 * Poll the status of a try-on job.
 */
export async function getTryOnStatus(jobId: string): Promise<TryOnResponse> {
  const { data } = await api.get<TryOnResponse>(`/tryon/${jobId}`);
  return data;
}

/**
 * Update the style profile for a user after completing the style quiz.
 */
export async function updateUserProfile(
  userId: string,
  profile: UserProfile,
): Promise<void> {
  await api.post('/user/profile', profile, { params: { user_id: userId } });
}
