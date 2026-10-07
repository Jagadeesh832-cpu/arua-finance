import { getApiBaseUrl } from './apiUrl';

export async function addExpenseApi(expenseData) {
  const baseUrl = getApiBaseUrl();
  const token = localStorage.getItem('arua_jwt_token') || localStorage.getItem('token') || '';

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

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
  const token = localStorage.getItem('arua_jwt_token') || localStorage.getItem('token') || '';

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

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
  const token = localStorage.getItem('arua_jwt_token') || localStorage.getItem('token') || '';

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(`${baseUrl}/api/user/expenses/${encodeURIComponent(expenseId)}?identifier=${encodeURIComponent(identifier)}`, {
    method: 'DELETE',
    headers
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || result.message || 'Failed to delete expense');
  }

  return result;
}
