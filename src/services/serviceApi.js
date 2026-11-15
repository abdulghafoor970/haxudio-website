import { authService } from './authService';

const API_BASE = '/api';

/**
 * Fetch all published services from MongoDB Atlas via Express API.
 * Returns null if API/database is unreachable so callers can retain bundled fallback data,
 * or returns the live array (including empty []) when the CMS responds cleanly.
 */
export async function fetchPublicServices() {
  try {
    const res = await fetch(`${API_BASE}/services`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[Public Services API] HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    }

    return null;
  } catch (err) {
    console.warn('[Public Services API Network Error]:', err.message);
    return null;
  }
}

/**
 * Fetch a single published service by slug.
 * Returns { status: 'ok', data }, { status: 'not_found' }, or null on network/server failure.
 */
export async function fetchPublicServiceBySlug(slug) {
  if (!slug) return null;

  try {
    const res = await fetch(`${API_BASE}/services/${encodeURIComponent(slug)}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.status === 404) {
      return { notFound: true };
    }

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.data) {
        return data.data;
      }
    }

    return null;
  } catch (err) {
    console.warn('[Public Service Slug API Error]:', err.message);
    return null;
  }
}

/**
 * Helper to build authenticated headers
 */
function getAuthHeaders() {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * ADMIN: Fetch all services (published and drafts)
 */
export async function fetchAdminServices() {
  const res = await fetch(`${API_BASE}/admin/services`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch services list');
  }

  return data;
}

/**
 * ADMIN: Fetch single service by ID
 */
export async function fetchAdminServiceById(id) {
  const res = await fetch(`${API_BASE}/admin/services/${id}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch service details');
  }

  return data.data;
}

/**
 * ADMIN: Create new service
 */
export async function createAdminService(serviceData) {
  const res = await fetch(`${API_BASE}/admin/services`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(serviceData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create service');
  }

  return data.data;
}

/**
 * ADMIN: Update existing service
 */
export async function updateAdminService(id, serviceData) {
  const res = await fetch(`${API_BASE}/admin/services/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(serviceData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update service');
  }

  return data.data;
}

/**
 * ADMIN: Toggle service published status
 */
export async function togglePublishAdminService(id) {
  const res = await fetch(`${API_BASE}/admin/services/${id}/toggle-publish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to toggle publish status');
  }

  return data.data;
}

/**
 * ADMIN: Delete service
 */
export async function deleteAdminService(id) {
  const res = await fetch(`${API_BASE}/admin/services/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete service');
  }

  return data;
}
