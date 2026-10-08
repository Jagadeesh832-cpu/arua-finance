import { getApiBaseUrl } from './apiUrl';
import { getAuthHeaders } from './authToken';

export async function addExpenseApi(expenseData) {
  const baseUrl = getApiBaseUrl();
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/api/user/expenses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(expenseData)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || result.message || 'Failed to add expense');
  }

  return result;
}

export async function updateExpenseApi(expenseId, updates) {
  const baseUrl = getApiBaseUrl();
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/api/user/expenses/${encodeURIComponent(expenseId)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || result.message || 'Failed to update expense');
  }

  return result;
}

export async function deleteExpenseApi(expenseId, identifier) {
  const baseUrl = getApiBaseUrl();
  const headers = getAuthHeaders();

  const queryParam = identifier ? `?identifier=${encodeURIComponent(identifier)}` : '';
  const response = await fetch(`${baseUrl}/api/user/expenses/${encodeURIComponent(expenseId)}${queryParam}`, {
    method: 'DELETE',
    headers
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || result.message || 'Failed to delete expense');
  }

  return result;
}

export async function fetchExpenseProofApi(expenseId) {
  const baseUrl = getApiBaseUrl();
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/api/user/expenses/${encodeURIComponent(expenseId)}/proof`, {
    method: 'GET',
    headers
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || result.message || 'Failed to verify expense proof');
  }

  return result;
}
