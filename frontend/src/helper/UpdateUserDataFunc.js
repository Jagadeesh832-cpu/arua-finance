import { getApiBaseUrl } from './apiUrl';

export default async function UpdateUserDataFunc(userData) {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/user/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update user data');
    }

    return result;
  } catch (error) {
    console.error('Error updating user:', error.message);
    throw error;
  }
}
