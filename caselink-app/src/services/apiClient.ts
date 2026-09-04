/**
 * Centralized API Client for CASELINK Platform
 * Supports dynamic Render Cloud / Localhost switching, HTTPS auto-detection,
 * and live interaction verification.
 */

export const DEFAULT_DEV_URL = 'http://localhost:8000/api/v1';
export const DEFAULT_RENDER_URL = 'https://caselink-backend.onrender.com/api/v1';

export function normalizeApiUrl(rawUrl: string): string {
  let url = rawUrl.trim().replace(/\/+$/, '');
  // If user pasted bare domain like https://caselink-backend.onrender.com
  // Append /api/v1 if not already present
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
}

export function getApiBaseUrl(): string {
  // 1. Check user custom URL from localStorage
  const custom = localStorage.getItem('caselink_api_url');
  if (custom && custom.trim()) {
    return normalizeApiUrl(custom);
  }

  // 2. Check build-time VITE_API_URL environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return normalizeApiUrl(envUrl);
  }

  // 3. If running in browser over HTTPS (e.g. Vercel deployment),
  // NEVER default to http://localhost (Browser blocks mixed content)
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return DEFAULT_RENDER_URL;
  }

  // 4. Default for local development
  return DEFAULT_DEV_URL;
}

export function setApiBaseUrl(url: string): void {
  const clean = normalizeApiUrl(url);
  localStorage.setItem('caselink_api_url', clean);
  window.dispatchEvent(new Event('caselink_api_url_changed'));
}

export function resetApiBaseUrl(): void {
  localStorage.removeItem('caselink_api_url');
  window.dispatchEvent(new Event('caselink_api_url_changed'));
}

export interface HealthPingResult {
  healthy: boolean;
  latencyMs: number;
  data?: any;
  error?: string;
  urlChecked?: string;
}

export async function pingBackendHealth(targetBaseUrl?: string): Promise<HealthPingResult> {
  const base = targetBaseUrl ? normalizeApiUrl(targetBaseUrl) : getApiBaseUrl();
  const rootUrl = base.replace(/\/api\/v1\/?$/, '');
  const healthUrl = `${rootUrl}/health`;

  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { healthy: true, latencyMs, data, urlChecked: healthUrl };
    }
    return {
      healthy: false,
      latencyMs,
      error: `Server responded with HTTP ${res.status}`,
      urlChecked: healthUrl,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      healthy: false,
      latencyMs,
      error: err.name === 'AbortError' ? 'Ping timed out (Render sleeping)' : err.message || 'Connecting...',
      urlChecked: healthUrl,
    };
  }
}

/**
 * Verify live data communication by actively fetching cases from the backend.
 */
export async function testBackendInteraction(targetBaseUrl?: string): Promise<{
  success: boolean;
  caseCount: number;
  latencyMs: number;
  error?: string;
}> {
  const start = performance.now();
  try {
    const base = targetBaseUrl ? normalizeApiUrl(targetBaseUrl) : getApiBaseUrl();
    const res = await fetch(`${base}/cases`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const latencyMs = Math.round(performance.now() - start);
    if (res.ok) {
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : (data.cases?.length || 0);
      return { success: true, caseCount: count, latencyMs };
    }
    return { success: false, caseCount: 0, latencyMs, error: `HTTP ${res.status}` };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return { success: false, caseCount: 0, latencyMs, error: err.message || 'Failed to connect' };
  }
}

export async function wakeUpBackend(
  onProgress?: (attempt: number, maxAttempts: number, message: string) => void,
  maxAttempts = 25
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (onProgress) {
      onProgress(
        attempt,
        maxAttempts,
        `Probe ${attempt}: Activating Render container...`
      );
    }

    const ping = await pingBackendHealth();
    if (ping.healthy) {
      if (onProgress) {
        onProgress(attempt, maxAttempts, `Active in ${ping.latencyMs}ms! Connected and ready.`);
      }
      return true;
    }

    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return false;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = localStorage.getItem('caselink_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorDetail;
      } catch {
        // Non-JSON error
      }
      console.warn(`[CASELINK API] ${options.method || 'GET'} ${fullUrl} -> ${response.status}: ${errorDetail}`);
      throw new Error(errorDetail);
    }

    const data = await response.json();
    console.info(`[CASELINK API] ${options.method || 'GET'} ${fullUrl} -> 200 OK`);
    return data;
  } catch (err: any) {
    console.warn(`[CASELINK API Network Error] ${options.method || 'GET'} ${fullUrl}: ${err.message}`);
    throw err;
  }
}

export default apiRequest;
