// src/lib/api.ts

// 1) Read the base URL from Vite env (string or empty).
// - In dev: VITE_API_BASE_URL === ''  → relative URLs like `/api/v1/...`
// - In prod: VITE_API_BASE_URL === 'http://101.46.58.237:8080' (or your domain)
const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

/** Build a full URL by joining BASE and the path. Ensures exactly one slash. */
export function apiUrl(path: string) {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`
}

/** Common headers – add Authorization once here, affects every request */
function defaultHeaders() {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }
  // Example: bearer token from localStorage (optional)
  const token = localStorage.getItem('access_token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

/** A small helper to throw on non-2xx and return JSON when available */
async function parseJsonOrThrow(res: Response) {
  const text = await res.text()
  if (!res.ok) {
    // Try to parse JSON error, fall back to raw text
    let message = text
    try { message = (JSON.parse(text)?.message ?? text) } catch {}
    const err = new Error(message)
    // Attach status for easier handling in callers
    ;(err as any).status = res.status
    throw err
  }
  // Empty body? return null
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

/** A tiny typed wrapper you can expand (add put/patch/delete as needed). */
export const API = {
  get: (p: string, init?: RequestInit) =>
    fetch(apiUrl(p), {
      ...init,
      method: 'GET',
      headers: { ...defaultHeaders(), ...(init?.headers as any) }
    }).then(parseJsonOrThrow),

  post: (p: string, body?: unknown, init?: RequestInit) =>
    fetch(apiUrl(p), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...defaultHeaders(), ...(init?.headers as any) },
      body: body == null ? undefined : JSON.stringify(body),
      ...init
    }).then(parseJsonOrThrow),

  put: (p: string, body?: unknown, init?: RequestInit) =>
    fetch(apiUrl(p), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...defaultHeaders(), ...(init?.headers as any) },
      body: body == null ? undefined : JSON.stringify(body),
      ...init
    }).then(parseJsonOrThrow),

  del: (p: string, init?: RequestInit) =>
    fetch(apiUrl(p), {
      ...init,
      method: 'DELETE',
      headers: { ...defaultHeaders(), ...(init?.headers as any) }
    }).then(parseJsonOrThrow)
}
