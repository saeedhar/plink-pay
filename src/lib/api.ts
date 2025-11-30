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

/** Token helpers (user portal) */
function getAccessToken() {
  return localStorage.getItem('accessToken') || ''
}
function getRefreshToken() {
  return localStorage.getItem('refreshToken') || ''
}
function setTokens(accessToken: string, refreshToken?: string) {
  if (accessToken) localStorage.setItem('accessToken', accessToken)
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
}

/** Common headers – add Authorization once here, affects every request */
function defaultHeaders() {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }
  const token = getAccessToken()
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

/**
 * Show session expired message and clear tokens
 * Uses a custom event to trigger the modal without importing it
 */
function showSessionExpiredMessage() {
  // Dispatch a custom event that App.tsx listens to
  // This avoids circular dependencies and build warnings
  window.dispatchEvent(new CustomEvent('session-expired'));
}

/**
 * Clear tokens and logout user
 */
function clearTokensAndLogout(sessionExpired: boolean = false) {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userId')
  localStorage.removeItem('callbackId')
  localStorage.removeItem('deviceId')
  
  // Only redirect if we're not already on a public page
  const currentPath = window.location.pathname
  const publicPaths = ['/login', '/login/verify-otp', '/forgot-password', '/account-locked', '/']
  if (!publicPaths.some(path => currentPath.startsWith(path))) {
    // Use window.location to ensure a full page reload and clear any state
    // Pass session expired flag via URL parameter
    const redirectUrl = sessionExpired ? '/login?sessionExpired=true' : '/login'
    window.location.href = redirectUrl
  } else if (sessionExpired && currentPath.startsWith('/login')) {
    // If already on login page, add the parameter
    const url = new URL(window.location.href)
    url.searchParams.set('sessionExpired', 'true')
    window.history.replaceState({}, '', url.toString())
  }
}

/**
 * Refresh access token using refresh token.
 * Backend returns { accessToken, refreshToken, expiresIn }
 */
let refreshing: Promise<void> | null = null
async function refreshAccessToken(): Promise<void> {
  // If already refreshing, wait for that promise
  if (refreshing) {
    return refreshing
  }
  
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    console.warn('⚠️ No refresh token available')
    clearTokensAndLogout(true) // Pass sessionExpired flag
    throw new Error('No refresh token')
  }

  refreshing = fetch(apiUrl('/api/v1/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })
    .then(async (res) => {
      const text = await res.text()
      
      // If refresh token endpoint returns 401, refresh token is expired/invalid
      if (res.status === 401) {
        console.warn('⚠️ Refresh token expired or invalid')
        clearTokensAndLogout(true) // Pass sessionExpired flag
        throw new Error('Refresh token expired')
      }
      
      if (!res.ok) {
        let msg = text
        try { msg = JSON.parse(text)?.message ?? msg } catch {}
        console.error('❌ Token refresh failed:', msg)
        // If refresh fails for other reasons, clear tokens and logout
        clearTokensAndLogout(true) // Pass sessionExpired flag
        throw new Error(msg || `HTTP ${res.status}`)
      }
      
      // Parse JSON response safely
      let data: any = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error('❌ Failed to parse refresh token response as JSON:', parseError)
        console.error('Response text:', text)
        clearTokensAndLogout(true)
        throw new Error('Invalid refresh response format')
      }
      
      if (data?.accessToken) {
        setTokens(data.accessToken, data.refreshToken)
        console.log('✅ Token refreshed successfully')
      } else {
        console.error('❌ No access token in refresh response')
        console.error('Response data:', data)
        clearTokensAndLogout(true) // Pass sessionExpired flag
        throw new Error('Invalid refresh response')
      }
    })
    .catch((error) => {
      // If refresh fails, clear tokens and logout
      console.error('❌ Token refresh error:', error)
      if (error.message !== 'Refresh token expired') {
        clearTokensAndLogout(true) // Pass sessionExpired flag
      }
      throw error
    })
    .finally(() => { 
      refreshing = null 
    })

  return refreshing
}

/** Perform fetch with auth and auto-refresh on 401/403 once */
async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
  // Don't retry refresh token endpoint itself
  const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : ''
  if (url.includes('/auth/refresh')) {
    return fetch(input, init)
  }
  
  const doFetch = () => {
    const headers = new Headers(init?.headers)
    const token = getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return fetch(input, { ...init, headers })
  }
  
  let res = await doFetch()
  
  // Handle 401 (Unauthorized) - token expired
  if (res.status === 401) {
    // Attempt a single refresh and retry
    try {
      console.log('🔄 Access token expired (401), refreshing...')
      await refreshAccessToken()
      
      // Retry the original request with new token
      const headers = new Headers(init?.headers)
      const newToken = getAccessToken()
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`)
      }
      res = await fetch(input, { ...init, headers })
      
      // If still 401 after refresh, logout
      if (res.status === 401) {
        console.warn('⚠️ Still unauthorized after token refresh, logging out')
        clearTokensAndLogout(true) // Pass sessionExpired flag
      }
    } catch (error: any) {
      // If refresh failed, the error handler already logged out the user
      console.error('❌ Failed to refresh token:', error)
      // Return the original 401 response
    }
  }
  
  // Handle 403 (Forbidden) - treat as session expiration
  // Show message, clear tokens, and redirect to login
  if (res.status === 403) {
    const token = getAccessToken()
    if (token) {
      // If we have a token but got 403, likely session expired or token invalid
      console.warn('⚠️ Forbidden (403) with token present - treating as session expiration')
      // Try to refresh token first (one attempt)
      try {
        console.log('🔄 Attempting token refresh due to 403...')
        await refreshAccessToken()
        
        // Retry the original request with new token
        const headers = new Headers(init?.headers)
        const newToken = getAccessToken()
        if (newToken) {
          headers.set('Authorization', `Bearer ${newToken}`)
        }
        res = await fetch(input, { ...init, headers })
        
        // If still 403 after refresh, show message and logout
        if (res.status === 403) {
          console.warn('⚠️ Still forbidden after token refresh - session expired')
          showSessionExpiredMessage()
          // Return the response so the error can be handled, but redirect will happen
          return res
        }
      } catch (error: any) {
        // If refresh failed, show message and logout
        console.error('❌ Failed to refresh token on 403:', error)
        showSessionExpiredMessage()
        // Return the response so the error can be handled, but redirect will happen
        return res
      }
    } else {
      // No token but got 403 - show message and redirect to login
      console.warn('⚠️ Forbidden (403) without token - redirecting to login')
      showSessionExpiredMessage()
      // Return the response so the error can be handled, but redirect will happen
      return res
    }
  }
  
  return res
}

/** A small helper to throw on non-2xx and return JSON when available */
async function parseJsonOrThrow(res: Response) {
  const text = await res.text()
  if (!res.ok) {
    // Handle 403 as session expiration - show message and redirect
    if (res.status === 403) {
      const token = getAccessToken()
      // fetchWithAuth should have already handled 403, but if we're here,
      // it means the refresh failed or we're still forbidden
      if (token) {
        console.warn('⚠️ 403 error with token - session expired, showing message and redirecting')
        showSessionExpiredMessage()
        // Throw a special error that indicates redirect is happening
        const redirectError = new Error('Session expired - redirecting to login')
        ;(redirectError as any).status = res.status
        ;(redirectError as any).redirecting = true
        throw redirectError
      }
    }
    
    // Handle 401 as session expiration
    if (res.status === 401) {
      const token = getAccessToken()
      if (token) {
        // If we have a token but got 401, session likely expired
        // The fetchWithAuth should have already tried to refresh, but if we're here,
        // it means the refresh failed or we're still unauthorized
        console.warn('⚠️ 401 error with token - session expired, redirecting to login')
        clearTokensAndLogout(true)
        // Throw a special error that indicates redirect is happening
        const redirectError = new Error('Session expired - redirecting to login')
        ;(redirectError as any).status = res.status
        ;(redirectError as any).redirecting = true
        throw redirectError
      }
    }
    
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
    fetchWithAuth(apiUrl(p), {
      ...init,
      method: 'GET',
      headers: { ...defaultHeaders(), ...(init?.headers as any) }
    }).then(parseJsonOrThrow),

  post: (p: string, body?: unknown, init?: RequestInit) =>
    fetchWithAuth(apiUrl(p), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...defaultHeaders(), ...(init?.headers as any) },
      body: body == null ? undefined : JSON.stringify(body),
      ...init
    }).then(parseJsonOrThrow),

  put: (p: string, body?: unknown, init?: RequestInit) =>
    fetchWithAuth(apiUrl(p), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...defaultHeaders(), ...(init?.headers as any) },
      body: body == null ? undefined : JSON.stringify(body),
      ...init
    }).then(parseJsonOrThrow),

  del: (p: string, init?: RequestInit) =>
    fetchWithAuth(apiUrl(p), {
      ...init,
      method: 'DELETE',
      headers: { ...defaultHeaders(), ...(init?.headers as any) }
    }).then(parseJsonOrThrow)
}
