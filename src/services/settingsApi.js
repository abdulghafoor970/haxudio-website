import { authService } from './authService';

const API_BASE = '/api';

function getAuthHeaders() {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * PUBLIC: Safe read-only settings for public website display
 * Returns { success, data: { business, contact, social, branding, globalCta, seoDefaults } }
 */
export async function fetchPublicSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings/public`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[Settings API] HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data && data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.warn('[Settings API Error]:', err.message);
    return null;
  }
}

/**
 * ADMIN: Get full settings document
 */
export async function fetchAdminSettings() {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch global settings');
  }

  return data.data;
}

/**
 * ADMIN: Update global settings document
 */
export async function updateAdminSettings(settingsData) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settingsData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update global settings');
  }

  return data.data;
}
