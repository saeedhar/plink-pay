import { apiUrl } from '../../../lib/api';

/**
 * HTTP wrapper for admin API calls that automatically injects Authorization header
 */
export async function adminHttp<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  // Get token from sessionStorage
  const token = (sessionStorage.getItem('admin_token') ?? '').trim();
  
  // Build full URL - use apiUrl for consistency with other services
  const url = apiUrl(path);
  
  console.log('AdminHttp: Making request to', url, 'with token:', token ? 'present' : 'missing');
  
  // Prepare headers
  const headers = new Headers(init.headers);
  
  // Add Authorization header if token exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Add Content-Type for JSON requests if not already set
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Make the request
  const response = await fetch(url, {
    ...init,
    headers
  });
  
  console.log('AdminHttp: Response status:', response.status, 'Content-Type:', response.headers.get('Content-Type'));
  
  // Handle non-ok responses
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If not JSON, use status text or the text itself
      errorMessage = response.statusText || errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  // Parse JSON response - handle empty responses (like DELETE)
  const contentType = response.headers.get('Content-Type');
  const contentLength = response.headers.get('Content-Length');
  
  // If no content or empty response, return null
  if (contentLength === '0' || !contentType?.includes('application/json')) {
    const text = await response.text();
    if (!text) return null as T;
  }
  
  return response.json() as Promise<T>;
}
