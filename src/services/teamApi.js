import { authService } from './authService';

const API_BASE = '/api';

/**
 * Fetch all published team members from MongoDB Atlas via Express API.
 * Returns null when offline/error so static preview fallback can remain intact.
 */
export async function fetchPublicTeam() {
  try {
    const res = await fetch(`${API_BASE}/team`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[Public Team API] HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    }

    return null;
  } catch (err) {
    console.warn('[Public Team API Network Error]:', err.message);
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
 * ADMIN: Fetch all team members (published and drafts)
 */
export async function fetchAdminTeam() {
  const res = await fetch(`${API_BASE}/admin/team`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch team members list');
  }

  return data;
}

/**
 * ADMIN: Fetch single team member by ID
 */
export async function fetchAdminTeamMemberById(id) {
  const res = await fetch(`${API_BASE}/admin/team/${id}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch team member details');
  }

  return data.data;
}

/**
 * ADMIN: Create new team member document in MongoDB Atlas
 */
export async function createAdminTeamMember(memberData) {
  const res = await fetch(`${API_BASE}/admin/team`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(memberData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create team member');
  }

  return data.data;
}

/**
 * ADMIN: Update existing team member document in MongoDB Atlas
 */
export async function updateAdminTeamMember(id, memberData) {
  const res = await fetch(`${API_BASE}/admin/team/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(memberData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update team member');
  }

  return data.data;
}

/**
 * ADMIN: Quick toggle published status
 */
export async function togglePublishAdminTeamMember(id) {
  const res = await fetch(`${API_BASE}/admin/team/${id}/toggle-publish`, {
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
 * ADMIN: Delete team member document from MongoDB Atlas
 */
export async function deleteAdminTeamMember(id) {
  const res = await fetch(`${API_BASE}/admin/team/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete team member');
  }

  return data;
}
