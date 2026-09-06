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

// Health cache to avoid redundant parallel network storms
let lastHealthCheck: { result: HealthPingResult; timestamp: number } | null = null;
const CACHE_TTL_MS = 6000; // 6 seconds

export function isOfflineModeEnabled(): boolean {
  return localStorage.getItem('caselink_offline_mode') === 'true';
}

export function setOfflineModeEnabled(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem('caselink_offline_mode', 'true');
  } else {
    localStorage.removeItem('caselink_offline_mode');
  }
  window.dispatchEvent(new Event('caselink_api_url_changed'));
}

export interface HealthPingOptions {
  targetBaseUrl?: string;
  forceFresh?: boolean;
  timeoutMs?: number;
}

export async function pingBackendHealth(options?: HealthPingOptions | string): Promise<HealthPingResult> {
  // Support string or object argument for backward compatibility
  const targetBaseUrl = typeof options === 'string' ? options : options?.targetBaseUrl;
  const forceFresh = typeof options === 'object' ? options.forceFresh : false;
  const timeoutMs = typeof options === 'object' && options.timeoutMs ? options.timeoutMs : 1600;

  // Return cached result if fresh and not forced
  const now = Date.now();
  if (!forceFresh && !targetBaseUrl && lastHealthCheck && (now - lastHealthCheck.timestamp < CACHE_TTL_MS)) {
    return lastHealthCheck.result;
  }

  const base = targetBaseUrl ? normalizeApiUrl(targetBaseUrl) : getApiBaseUrl();
  const rootUrl = base.replace(/\/api\/v1\/?$/, '');

  // Fast ping first: Try /ping with lightweight HEAD/GET, fallback to /health
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Attempt /ping first (< 1ms backend processing time)
    const pingUrl = `${rootUrl}/ping`;
    const res = await fetch(pingUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    }).catch(() => null);

    if (res && res.ok) {
      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - start);
      const data = await res.json().catch(() => ({ status: 'ok' }));
      const result: HealthPingResult = {
        healthy: true,
        latencyMs,
        data,
        urlChecked: pingUrl,
      };
      if (!targetBaseUrl) {
        lastHealthCheck = { result, timestamp: Date.now() };
      }
      return result;
    }

    // Secondary fallback: /health
    const healthUrl = `${rootUrl}/health`;
    const healthRes = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);

    if (healthRes.ok) {
      const data = await healthRes.json().catch(() => ({}));
      const result: HealthPingResult = { healthy: true, latencyMs, data, urlChecked: healthUrl };
      if (!targetBaseUrl) {
        lastHealthCheck = { result, timestamp: Date.now() };
      }
      return result;
    }

    const failureResult: HealthPingResult = {
      healthy: false,
      latencyMs,
      error: `Server responded with HTTP ${healthRes.status}`,
      urlChecked: healthUrl,
    };
    if (!targetBaseUrl) {
      lastHealthCheck = { result: failureResult, timestamp: Date.now() };
    }
    return failureResult;
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - start);
    const errorMsg = err.name === 'AbortError'
      ? 'Ping timed out (> 1.6s) - Server sleeping'
      : (err.message || 'Connecting...');

    const failureResult: HealthPingResult = {
      healthy: false,
      latencyMs,
      error: errorMsg,
      urlChecked: `${rootUrl}/ping`,
    };
    if (!targetBaseUrl) {
      lastHealthCheck = { result: failureResult, timestamp: Date.now() };
    }
    return failureResult;
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${base}/cases`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);
    if (res.ok) {
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : (data.cases?.length || 0);
      return { success: true, caseCount: count, latencyMs };
    }
    return { success: false, caseCount: 0, latencyMs, error: `HTTP ${res.status}` };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      success: false,
      caseCount: 0,
      latencyMs,
      error: err.name === 'AbortError' ? 'Connection timed out (> 3.5s)' : (err.message || 'Failed to connect'),
    };
  }
}

export async function wakeUpBackend(
  onProgress?: (attempt: number, maxAttempts: number, message: string) => void,
  maxAttempts = 20
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (onProgress) {
      onProgress(
        attempt,
        maxAttempts,
        `Probe ${attempt}: Signaling server container...`
      );
    }

    // Force fresh fast probe with 1500ms timeout
    const ping = await pingBackendHealth({ forceFresh: true, timeoutMs: 1500 });
    if (ping.healthy) {
      if (onProgress) {
        onProgress(attempt, maxAttempts, `Active in ${ping.latencyMs}ms! Connected and ready.`);
      }
      return true;
    }

    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 700));
    }
  }

  return false;
}

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  if (isOfflineModeEnabled()) {
    throw new Error('Tactical Offline Mode active - utilizing local intelligence cache.');
  }

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
  const timeoutMs = options.timeoutMs ?? 5000; // 5-second default timeout to prevent long hangs

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);

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
    clearTimeout(timeoutId);
    const msg = err.name === 'AbortError'
      ? `Request timed out after ${timeoutMs}ms (Render server cold start)`
      : err.message || 'Connection error';
    console.warn(`[CASELINK API Network Error] ${options.method || 'GET'} ${fullUrl}: ${msg}`);
    throw new Error(msg);
  }
}

export default apiRequest;
