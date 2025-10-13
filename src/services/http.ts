import { getScenarioHeader } from '../dev/mockBridge';

export async function http<T=unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  
  // Use empty string to use Vite proxy, or full URL if VITE_USE_MOCKS is true
  const baseUrl = import.meta.env.VITE_USE_MOCKS === 'true' ? '' : '';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    headers.set('x-mock-scenario', getScenarioHeader());
  }
  
  const res = await fetch(fullUrl, { ...init, headers });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}
