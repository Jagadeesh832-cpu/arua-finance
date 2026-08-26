/**
 * Safely resolves the API Base URL from environment variables.
 * Strips all trailing slashes and whitespace to prevent '//' double-slash routing issues.
 */
export function getApiBaseUrl() {
  let url = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_ServerUrl || '';
  if (typeof url === 'string') {
    url = url.trim().replace(/\/+$/, '');
  }
  return url || '';
}

export default getApiBaseUrl;
