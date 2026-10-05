import { authService } from './authService';

const API_BASE = '/api';

/**
 * Helper to build auth headers
 */
function getAuthHeaders() {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * PUBLIC: Submit an inquiry from contact form or quote builder
 * POST /api/inquiries
 */
export async function submitPublicInquiry(inquiryData) {
  const response = await fetch(`${API_BASE}/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inquiryData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    const errorMsg = data.message || `Submission failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * ADMIN: Fetch inquiries with optional status, isRead, search, and sort filters
 * GET /api/admin/inquiries
 */
export async function fetchAdminInquiries(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.isRead !== undefined && filters.isRead !== 'all') params.append('isRead', filters.isRead);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const url = `${API_BASE}/admin/inquiries${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in.');
    }
    throw new Error(data.message || 'Failed to fetch inquiries.');
  }

  return data;
}

/**
 * ADMIN: Fetch single inquiry by ID
 * GET /api/admin/inquiries/:id
 */
export async function fetchAdminInquiryById(id) {
  const response = await fetch(`${API_BASE}/admin/inquiries/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch inquiry details.');
  }

  return data.data;
}

/**
 * ADMIN: Update inquiry status
 * PATCH /api/admin/inquiries/:id/status
 */
export async function updateInquiryStatus(id, status) {
  const response = await fetch(`${API_BASE}/admin/inquiries/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update inquiry status.');
  }

  return data;
}

/**
 * ADMIN: Update inquiry read/unread state
 * PATCH /api/admin/inquiries/:id/read
 */
export async function updateInquiryRead(id, isRead) {
  const response = await fetch(`${API_BASE}/admin/inquiries/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isRead }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update inquiry read state.');
  }

  return data;
}

/**
 * ADMIN: Update private admin notes
 * PATCH /api/admin/inquiries/:id/notes
 */
export async function updateInquiryNotes(id, adminNotes) {
  const response = await fetch(`${API_BASE}/admin/inquiries/${id}/notes`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ adminNotes }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to save admin notes.');
  }

  return data;
}

/**
 * ADMIN: Delete inquiry
 * DELETE /api/admin/inquiries/:id
 */
export async function deleteInquiry(id) {
  const response = await fetch(`${API_BASE}/admin/inquiries/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete inquiry.');
  }

  return data;
}
