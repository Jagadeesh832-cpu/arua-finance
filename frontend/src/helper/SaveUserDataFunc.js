
export default async function SaveUserDataFunc(userData) {
  try {
    const baseUrl = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_ServerUrl || '';
    const response = await fetch(`${baseUrl}/api/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save user data');
    }

    return result;
  } catch (error) {
    console.error('Error saving user:', error.message);
    throw error;
  }
}
