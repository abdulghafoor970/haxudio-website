import { authService } from './authService';

const API_BASE = '/api';

/**
 * Fetch all published testimonials from MongoDB Atlas via Express API.
 * Returns null when offline/error so static preview fallback can remain intact.
 */
export async function fetchPublicTestimonials() {
  try {
    const res = await fetch(`${API_BASE}/testimonials`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[Public Testimonials API] HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    }

    return null;
  } catch (err) {
    console.warn('[Public Testimonials API Network Error]:', err.message);
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
 * ADMIN: Fetch all testimonials (published and drafts)
 */
export async function fetchAdminTestimonials() {
  const res = await fetch(`${API_BASE}/admin/testimonials`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch testimonials list');
  }

  return data;
}

/**
 * ADMIN: Fetch single testimonial by ID
 */
export async function fetchAdminTestimonialById(id) {
  const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch testimonial details');
  }

  return data.data;
}

/**
 * ADMIN: Create new testimonial document in MongoDB Atlas
 */
export async function createAdminTestimonial(testimonialData) {
  const res = await fetch(`${API_BASE}/admin/testimonials`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(testimonialData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create testimonial');
  }

  return data.data;
}

/**
 * ADMIN: Update existing testimonial document in MongoDB Atlas
 */
export async function updateAdminTestimonial(id, testimonialData) {
  const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(testimonialData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update testimonial');
  }

  return data.data;
}

/**
 * ADMIN: Quick toggle published status
 */
export async function togglePublishAdminTestimonial(id) {
  const res = await fetch(`${API_BASE}/admin/testimonials/${id}/toggle-publish`, {
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
 * ADMIN: Delete testimonial document from MongoDB Atlas
 */
export async function deleteAdminTestimonial(id) {
  const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete testimonial');
  }

  return data;
}
