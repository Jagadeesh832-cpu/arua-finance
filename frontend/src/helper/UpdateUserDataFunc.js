import { getApiBaseUrl } from './apiUrl';
import { getAuthHeaders } from './authToken';

export default async function UpdateUserDataFunc(userData) {
  try {
    const baseUrl = getApiBaseUrl();
    const headers = getAuthHeaders();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${baseUrl}/api/user/update`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Failed to update user data');
    }

    return result;
  } catch (error) {
    console.error('Error updating user:', error.message);
    throw error;
  }
}
