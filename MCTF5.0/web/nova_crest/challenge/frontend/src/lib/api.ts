const DEFAULT_API_BASE = '/api';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  DEFAULT_API_BASE;

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export interface ApiError {
  status: number;
  code?: string;
  message: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as {
    error?: { message?: string; code?: string };
  };

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      code: data.error?.code,
      message: data.error?.message || `Request failed with status ${response.status}`,
    };

    throw error;
  }

  return data as T;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  query?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  return parseResponse<T>(response);
}

export function toPrettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
