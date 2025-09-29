import { getScenarioHeader } from '../dev/mockBridge';

export async function http<T=unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  
  // Use real backend URL unless explicitly using mocks
  const baseUrl = import.meta.env.VITE_USE_MOCKS === 'true' ? '' : 'http://localhost:8084/api/v1';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    headers.set('x-mock-scenario', getScenarioHeader());
  }
  
  const res = await fetch(fullUrl, { ...init, headers });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}
