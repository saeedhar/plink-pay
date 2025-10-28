// src/lib/api.ts

// 1) Read the base URL from Vite env (string or empty).
// - In dev: VITE_API_BASE_URL === ''  → relative URLs like `/api/v1/...` (uses Vite proxy)
// - In prod: Use HTTP backend URL directly (if frontend is also HTTP)
let BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

// If BASE is empty, use HTTP backend directly
// This works if the frontend is served over HTTP (not HTTPS)
if (!BASE) {
  // In dev: use relative URLs (proxy will handle it)
  // In prod: use HTTP backend directly
  if (import.meta.env.DEV) {
    BASE = '' // Empty = relative URLs (uses Vite proxy)
  } else {
    // Always use HTTP backend (even if frontend is HTTPS, we need HTTP backend)
    BASE = 'http://101.46.58.237:8080' // Production: direct HTTP backend
  }
}

// Force HTTP - prevent browser from upgrading to HTTPS
if (BASE) {
  // If BASE contains our backend IP, ensure it's HTTP (not HTTPS)
  if (BASE.includes('101.46.58.237')) {
    BASE = BASE.replace(/^https:/, 'http:')
  }
}

/** Build a full URL by joining BASE and the path. Ensures exactly one slash. */
export function apiUrl(path: string) {
  let url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`
  
  // Force HTTP for backend IP (runtime check)
  if (url.includes('101.46.58.237')) {
    url = url.replace(/^https:/, 'http:')
  }
  
  // Debug: log the first API call to verify URL
  if (!(window as any).__apiUrlLogged) {
    console.log('🔗 API Base URL:', BASE || '(relative)')
    console.log('🔗 Full API URL example:', url)
    ;(window as any).__apiUrlLogged = true
  }
  return url
}

/** Common headers – add Authorization once here, affects every request */
function defaultHeaders() {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }
  // Example: bearer token from localStorage (optional)
  const token = localStorage.getItem('accessToken')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    // Debug: log token info (only first time)
    if (!(window as any).__tokenLogged) {
      console.log('🔑 Auth Token found:', token.substring(0, 20) + '...')
      ;(window as any).__tokenLogged = true
    }
  } else {
    // Debug: log when no token
    if (!(window as any).__noTokenLogged) {
      console.warn('⚠️ No auth token found in localStorage')
      ;(window as any).__noTokenLogged = true
    }
  }
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
