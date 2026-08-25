export default async function GetUserDataFunc(identifier) {
  try {
    if (!identifier) return null;
    const isPhone = identifier.startsWith('+') || /^\d+$/.test(identifier);
    const paramKey = isPhone ? 'phone' : 'email';
    const baseUrl = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_ServerUrl || '';
    const response = await fetch(`${baseUrl}/api/user?${paramKey}=${encodeURIComponent(identifier)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

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
