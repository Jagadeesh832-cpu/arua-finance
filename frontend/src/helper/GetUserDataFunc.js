import { getApiBaseUrl } from './apiUrl';
import { getAuthHeaders } from './authToken';

export default async function GetUserDataFunc(identifier) {
  try {
    if (!identifier) return null;
    const isPhone = identifier.startsWith('+') || /^\d+$/.test(identifier);
    const paramKey = isPhone ? 'phone' : 'email';
    const baseUrl = getApiBaseUrl();
    const headers = getAuthHeaders();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${baseUrl}/api/user?${paramKey}=${encodeURIComponent(identifier)}`, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await response.json();

    if (!response.ok) {
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }
}
