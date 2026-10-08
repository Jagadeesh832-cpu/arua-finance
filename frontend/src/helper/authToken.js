/**
 * Arua Finance — Standardized Frontend Token Manager
 * Manages JWT tokens across localStorage keys for 100% backward compatibility.
 */

const TOKEN_KEYS = ["arua_auth_token", "arua_jwt_token", "token"];

export function getAuthToken() {
  if (typeof window === "undefined") return "";
  for (const key of TOKEN_KEYS) {
    const val = localStorage.getItem(key);
    if (val && val.trim().length > 0) {
      return val.trim();
    }
  }
  return "";
}

export function setAuthToken(token) {
  if (typeof window === "undefined") return;
  if (!token) {
    clearAuthToken();
    return;
  }
  const clean = token.trim();
  for (const key of TOKEN_KEYS) {
    localStorage.setItem(key, clean);
  }
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  for (const key of TOKEN_KEYS) {
    localStorage.removeItem(key);
  }
}

export function getAuthHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: "Bearer " + token } : {})
  };
}

export default {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getAuthHeaders
};
