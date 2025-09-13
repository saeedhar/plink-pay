import { getScenarioHeader } from '../dev/mockBridge';

export async function http<T=unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    headers.set('x-mock-scenario', getScenarioHeader());
  }
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}
