/**
 * Single API client for all backend calls.
 * Uses base URL from VITE_API_BASE_URL or http://localhost:3001/api.
 * Automatically adds Authorization: Bearer <token> when logged in.
 */

const getBaseUrl = (): string => {
  const env = import.meta.env?.VITE_API_BASE_URL;
  if (env && typeof env === 'string') return env.replace(/\/$/, '');
  return 'http://localhost:3001/api';
};

const getToken = (): string | null => localStorage.getItem('accessToken');

function buildUrl(path: string): string {
  const base = getBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function getHeaders(includeAuth: boolean): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/** Parse JSON error body or generic message */
async function handleError(res: Response): Promise<never> {
  const data = await res.json().catch(() => ({}));
  const message = (data?.message as string) || res.statusText || 'Request failed';
  const err = new Error(message) as Error & { status?: number };
  err.status = res.status;
  throw err;
}

/**
 * GET request
 */
export async function get<T>(path: string): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'GET',
    headers: getHeaders(true),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * POST request
 */
export async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: getHeaders(!path.startsWith('/auth/')), // no auth for login
    body: JSON.stringify(body),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * PUT request
 */
export async function put<T>(path: string, body: object): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(body),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * PATCH request
 */
export async function patch<T>(path: string, body?: object): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'PATCH',
    headers: getHeaders(true),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/**
 * DELETE request
 */
export async function del<T>(path: string): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  if (!res.ok) await handleError(res);
  if (res.status === 204) return undefined as T;
  return res.json();
}

/**
 * POST request with FormData (for files)
 */
export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/** Single api object - use api.get(), api.post(), etc. */
export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  postFormData,
  getToken,
  getBaseUrl: () => getBaseUrl(),
};
