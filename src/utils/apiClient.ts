// Centralized API client helper for Dev, AI Studio Live, and Custom Domain deployments

const STORAGE_API_BASE_KEY = 'sms_live_api_base_url';
let runtimeApiBaseUrl = '';

export function setRuntimeApiBaseUrl(url?: string): void {
  runtimeApiBaseUrl = typeof url === 'string' ? url.trim().replace(/\/+$/, '') : '';
}

/**
 * Resolves the backend API base URL.
 * Priority:
 * 1. Build-time VITE_API_BASE_URL (when deployed to external static CDN like Netlify / Firebase Hosting)
 * 2. Admin-saved browser override in localStorage
 * 3. Firestore-synced school settings liveApiBaseUrl (propagates to all donors/students)
 * 4. Same-origin ('') when served by Express Node server (AI Studio Dev / AI Studio Live / Cloud Run)
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

  if (runtimeApiBaseUrl) {
    return runtimeApiBaseUrl;
  }

  return '';
}

export function setCustomApiBaseUrl(url: string): void {
  const clean = url.trim().replace(/\/+$/, '');
  setRuntimeApiBaseUrl(clean);
  try {
    if (typeof window !== 'undefined') {
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

function isLikelyHtmlPayload(rawText: string): boolean {
  const cleaned = rawText.replace(/^\uFEFF/, '').trim().toLowerCase();
  return (
    cleaned.startsWith('<!doctype') ||
    cleaned.startsWith('<html') ||
    cleaned.startsWith('<head') ||
    cleaned.startsWith('<body') ||
    cleaned.startsWith('<?xml') ||
    cleaned.startsWith('<')
  );
}

/**
 * Safely parses JSON from a fetch Response without throwing SyntaxError on HTML 404/502 error pages.
 */
export async function safeParseJson<T = any>(res: Response): Promise<{ ok: boolean; status: number; data: T | null; rawText: string; isHtmlFallback: boolean }> {
  const rawText = await res.text();
  if (!rawText) {
    return { ok: res.ok, status: res.status, data: null, rawText: '', isHtmlFallback: false };
  }

  if (isLikelyHtmlPayload(rawText)) {
    return { ok: false, status: res.status, data: null, rawText, isHtmlFallback: true };
  }

  try {
    const parsed = JSON.parse(rawText) as T;
    return { ok: res.ok, status: res.status, data: parsed, rawText, isHtmlFallback: false };
  } catch {
    return { ok: false, status: res.status, data: null, rawText, isHtmlFallback: false };
  }
}

export interface BackendHealthResult {
  reachable: boolean;
  isHtmlFallback: boolean;
  baseUrlUsed: string;
  health: {
    status: string;
    environment: string;
    smtpConfigured: boolean;
    cashfreeEnabled: boolean;
    cashfreeConfigured: boolean;
    cashfreeEnvironment?: 'sandbox' | 'production';
  } | null;
  error?: string;
}

export async function probeBackendHealth(): Promise<BackendHealthResult> {
  const targetUrl = apiUrl('/api/health');
  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    const parsed = await safeParseJson<any>(res);
    if (parsed.isHtmlFallback) {
      return {
        reachable: false,
        isHtmlFallback: true,
        baseUrlUsed: getApiBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : ''),
        health: null,
        error: 'This domain is serving static HTML (<!doctype html>) instead of the Node.js backend API.'
      };
    }
    if (parsed.ok && parsed.data) {
      return {
        reachable: true,
        isHtmlFallback: false,
        baseUrlUsed: getApiBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : ''),
        health: parsed.data
      };
    }
    return {
      reachable: false,
      isHtmlFallback: false,
      baseUrlUsed: getApiBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : ''),
      health: null,
      error: `Backend responded with HTTP ${res.status}`
    };
  } catch (err: any) {
    return {
      reachable: false,
      isHtmlFallback: false,
      baseUrlUsed: getApiBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : ''),
      health: null,
      error: err?.message || 'Unable to connect to backend API.'
    };
  }
}

