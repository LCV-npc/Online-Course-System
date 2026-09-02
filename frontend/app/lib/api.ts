export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';

export type ApiError = {
  error?: string;
  message?: string;
};

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('edupro_token');
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = false, headers, ...rest } = options;
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  const token = auth ? getAuthToken() : null;
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    let payload: ApiError | null = null;
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    const msg = payload?.error || payload?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  // DELETE / update có thể trả 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  try {
    const text = await res.text();
    if (!text) return undefined as unknown as T;
    return JSON.parse(text) as T;
  } catch {
    return undefined as unknown as T;
  }
}

