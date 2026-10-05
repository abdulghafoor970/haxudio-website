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
 * PUBLIC: Fetch active website content for a specific page (e.g. 'home', 'about', 'contact')
 * Returns { success, page, count, sections: { [section]: { title, content } }, data: [] }
 */
export async function fetchPublicContent(page) {
  if (!page) return null;
  try {
    const res = await fetch(`${API_BASE}/content/${encodeURIComponent(page)}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[Content API] HTTP ${res.status} for page: ${page}`);
      return null;
    }

    const data = await res.json();
    if (data && data.success) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn(`[Content API Error]: ${err.message}`);
    return null;
  }
}

/**
 * ADMIN: Fetch all content items across all pages
 */
export async function fetchAdminContent(page = null) {
  const url = page ? `${API_BASE}/admin/content?page=${encodeURIComponent(page)}` : `${API_BASE}/admin/content`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch content');
  }

  return data;
}

/**
 * ADMIN: Fetch all sections for a specific page
 */
export async function fetchAdminPageContent(page) {
  const res = await fetch(`${API_BASE}/admin/content/${encodeURIComponent(page)}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch content for page: ${page}`);
  }

  return data;
}

/**
 * ADMIN: Update or create a section's content (PUT /api/admin/content/:page/:section)
 */
export async function updateAdminContent(page, section, payload) {
  const res = await fetch(`${API_BASE}/admin/content/${encodeURIComponent(page)}/${encodeURIComponent(section)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update section content');
  }

  return data;
}

/**
 * ADMIN: Delete a section
 */
export async function deleteAdminContent(page, section) {
  const res = await fetch(`${API_BASE}/admin/content/${encodeURIComponent(page)}/${encodeURIComponent(section)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete section');
  }

  return data;
}
