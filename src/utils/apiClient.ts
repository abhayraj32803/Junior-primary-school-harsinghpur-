// Centralized API client helper for Dev, AI Studio Live, and Custom Domain deployments

const STORAGE_API_BASE_KEY = 'sms_live_api_base_url';

/**
 * Resolves the backend API base URL.
 * - Defaults to same-origin relative paths ('') when served by Express (Dev & AI Studio Live).
 * - Falls back to VITE_API_BASE_URL or saved backend URL when frontend is deployed to static hosting (e.g. Netlify).
 */
export function getApiBaseUrl(): string {
  try {
    const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL;
    if (typeof envBase === 'string' && envBase.trim()) {
      return envBase.trim().replace(/\/+$/, '');
    }
  } catch {
    // ignore
  }

  try {
    if (typeof window !== 'undefined') {
      const savedBase = localStorage.getItem(STORAGE_API_BASE_KEY);
      if (savedBase && savedBase.trim()) {
        return savedBase.trim().replace(/\/+$/, '');
      }
    }
  } catch {
    // ignore
  }

  return '';
}

export function setCustomApiBaseUrl(url: string): void {
  try {
    if (typeof window !== 'undefined') {
      const clean = url.trim().replace(/\/+$/, '');
      if (clean) localStorage.setItem(STORAGE_API_BASE_KEY, clean);
      else localStorage.removeItem(STORAGE_API_BASE_KEY);
    }
  } catch {
    // ignore
  }
}

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${cleanPath}` : cleanPath;
}

/**
 * Safely parses JSON from a fetch Response without throwing SyntaxError on HTML 404/502 error pages.
 */
export async function safeParseJson<T = any>(res: Response): Promise<{ ok: boolean; status: number; data: T | null; rawText: string; isHtmlFallback: boolean }> {
  const rawText = await res.text();
  if (!rawText) {
    return { ok: res.ok, status: res.status, data: null, rawText: '', isHtmlFallback: false };
  }

  const trimmed = rawText.trim();
  if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return { ok: false, status: res.status, data: null, rawText, isHtmlFallback: true };
  }

  try {
    const parsed = JSON.parse(rawText) as T;
    return { ok: res.ok, status: res.status, data: parsed, rawText, isHtmlFallback: false };
  } catch {
    return { ok: false, status: res.status, data: null, rawText, isHtmlFallback: false };
  }
}
