/**
 * Centralized API Client for CASELINK Platform
 * Supports dynamic Render Cloud / Localhost switching and Render Wake-Up pings.
 */

export const DEFAULT_DEV_URL = 'http://localhost:8000/api/v1';
export const DEFAULT_RENDER_URL = 'https://caselink-backend.onrender.com/api/v1';

export function getApiBaseUrl(): string {
  const custom = localStorage.getItem('caselink_api_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_DEV_URL;
}

export function setApiBaseUrl(url: string): void {
  const clean = url.trim().replace(/\/+$/, '');
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
}

export async function pingBackendHealth(targetBaseUrl?: string): Promise<HealthPingResult> {
  const base = targetBaseUrl ? targetBaseUrl.trim().replace(/\/+$/, '') : getApiBaseUrl();
  // Strip /api/v1 to reach root /health if needed, or use /health directly
  const rootUrl = base.replace(/\/api\/v1\/?$/, '');
  const healthUrl = `${rootUrl}/health`;

  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast turnaround

    const res = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { healthy: true, latencyMs, data };
    }
    return {
      healthy: false,
      latencyMs,
      error: `Server responded with HTTP ${res.status}`,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      healthy: false,
      latencyMs,
      error: err.name === 'AbortError' ? 'Ping timed out (server spinning up)' : err.message || 'Connecting...',
    };
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

    // Rapid 1-second interval for instant detection
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

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export default apiRequest;
