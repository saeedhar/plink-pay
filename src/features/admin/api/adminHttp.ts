/**
 * HTTP wrapper for admin API calls that automatically injects Authorization header
 */
export async function adminHttp<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
  // Get token from sessionStorage
  const token = (sessionStorage.getItem('admin_token') ?? '').trim();
  
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
  
  // Parse JSON response
  return response.json() as Promise<T>;
}
