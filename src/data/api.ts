/**
 * Central API client.
 *
 * Every request in the app goes through here so that three cross-cutting
 * concerns live in one place:
 *
 * 1. **Base URL.** In development Vite proxies `/api/*` to the local Node
 *    server. Once the API is deployed separately (Render / Railway / Fly) the
 *    front end is a static Netlify bundle, so `VITE_API_URL` points at the
 *    API host instead.
 * 2. **Session token.** Writes are authenticated with a short-lived bearer
 *    token that the server signs after a successful login. The password never
 *    travels again, and no secret is compiled into this bundle.
 * 3. **Connectivity state.** The portals need to tell the user the truth when
 *    the API is unreachable, otherwise a failed save looks like a successful
 *    one and the admin thinks the change is shared when it only lives in this
 *    browser.
 */

/** Trimmed, slash-free API origin, e.g. `https://jls-api.onrender.com`. */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

const TOKEN_KEYS = {
  admin: 'jl.api.token.admin',
  tech: 'jl.api.token.tech',
} as const;

export type SessionRole = keyof typeof TOKEN_KEYS;

export function readToken(role: SessionRole): string {
  try {
    return localStorage.getItem(TOKEN_KEYS[role]) ?? '';
  } catch {
    return '';
  }
}

export function writeToken(role: SessionRole, token: string) {
  try {
    localStorage.setItem(TOKEN_KEYS[role], token);
  } catch {
    /* storage unavailable — session lasts for this page only */
  }
}

export function clearToken(role: SessionRole) {
  try {
    localStorage.removeItem(TOKEN_KEYS[role]);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number;
  /** True when the request never reached the server (offline, DNS, CORS). */
  offline: boolean;

  constructor(message: string, status: number, offline = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.offline = offline;
  }
}

// ─── Connectivity tracking ────────────────────────────────────────────────────

export type ApiStatus = 'online' | 'offline' | 'checking';

type StatusListener = (status: ApiStatus) => void;
const statusListeners = new Set<StatusListener>();
let status: ApiStatus = 'checking';

export function apiStatus(): ApiStatus {
  return status;
}

function setStatus(next: ApiStatus) {
  if (status === next) return;
  status = next;
  statusListeners.forEach(fn => fn(next));
}

/** Subscribe to API connectivity. Returns an unsubscribe function. */
export function onApiStatus(fn: StatusListener): () => void {
  statusListeners.add(fn);
  fn(status);
  return () => {
    statusListeners.delete(fn);
  };
}

/** Health probe, used to decide whether to show the offline banner. */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/health'), { method: 'GET' });
    const ok = res.ok;
    setStatus(ok ? 'online' : 'offline');
    return ok;
  } catch {
    setStatus('offline');
    return false;
  }
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export interface ApiRequestInit extends Omit<RequestInit, 'body'> {
  /** Attaches the bearer token for this role. */
  role?: SessionRole;
  body?: unknown;
}

export async function apiJson<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { role, body, headers, ...rest } = init;
  const token = role ? readToken(role) : '';

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // Network-level failure: DNS, offline, or a CORS preflight rejection.
    setStatus('offline');
    throw new ApiError('Could not reach the server. Your change is stored on this device only.', 0, true);
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ?? `Request failed (${res.status}).`;
    // 401 means the session expired or the server was restarted with a new
    // secret: drop the dead token so the next request re-authenticates.
    if (res.status === 401 && role) clearToken(role);
    throw new ApiError(message, res.status, false);
  }

  setStatus('online');
  return data as T;
}
