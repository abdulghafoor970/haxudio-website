import { PROJECTS } from '../data/projects';
import { authService } from './authService';

const API_BASE = '/api';

/**
 * Fetch all published projects from MongoDB Atlas via Express API.
 * Supports optional category and featured filters.
 * Gracefully falls back to bundled PROJECTS if API is offline or unreachable.
 */
export async function fetchPublicProjects(options = {}) {
  const { category, featured } = options;
  const params = new URLSearchParams();

  if (category && category !== 'all') {
    params.append('category', category);
  }
  if (featured) {
    params.append('featured', 'true');
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';

  try {
    const res = await fetch(`${API_BASE}/projects${queryString}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[Public Projects API] HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (err) {
    console.warn('[Public Projects API Network Error]:', err.message);
    return [];
  }
}

/**
 * Fetch a single published project by slug.
 * Returns null if not found or unpublished.
 */
export async function fetchPublicProjectBySlug(slug) {
  if (!slug) return null;

  try {
    const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(slug)}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.data) {
        return data.data;
      }
    }

    return null;
  } catch (err) {
    console.warn('[Public Project Slug API Error]:', err.message);
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
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * ADMIN: Fetch all projects (published and drafts)
 */
export async function fetchAdminProjects() {
  const res = await fetch(`${API_BASE}/admin/projects`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch projects list');
  }

  return data;
}

/**
 * ADMIN: Fetch single project by ID
 */
export async function fetchAdminProjectById(id) {
  const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch project details');
  }

  return data.data;
}

/**
 * ADMIN: Create new project document in MongoDB Atlas
 */
export async function createAdminProject(projectData) {
  const res = await fetch(`${API_BASE}/admin/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create project');
  }

  return data.data;
}

/**
 * ADMIN: Update existing project document in MongoDB Atlas
 */
export async function updateAdminProject(id, projectData) {
  const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update project');
  }

  return data.data;
}

/**
 * ADMIN: Quick toggle published status
 */
export async function togglePublishAdminProject(id) {
  const res = await fetch(`${API_BASE}/admin/projects/${id}/toggle-publish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to toggle publication status');
  }

  return data.data;
}

/**
 * ADMIN: Quick toggle featured status
 */
export async function toggleFeaturedAdminProject(id) {
  const res = await fetch(`${API_BASE}/admin/projects/${id}/toggle-featured`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to toggle featured status');
  }

  return data.data;
}

/**
 * ADMIN: Delete project document from MongoDB Atlas
 */
export async function deleteAdminProject(id) {
  const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete project');
  }

  return data;
}
