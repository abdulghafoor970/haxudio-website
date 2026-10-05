import { authService } from './authService';

const API_BASE = '/api/admin/media';

function getAuthHeaders(isJson = true) {
  const token = authService.getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

/**
 * Check if Cloudinary is configured on the backend
 */
export async function fetchCloudinaryStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`, {
      headers: getAuthHeaders(true),
    });
    if (!res.ok) {
      return { configured: false, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    return { configured: false, error: err.message };
  }
}

/**
 * Fetch paginated media items with optional folder filtering and search
 */
export async function fetchMediaList({ page = 1, limit = 24, folder = 'all', search = '' } = {}) {
  const params = new URLSearchParams();
  if (page) params.set('page', page);
  if (limit) params.set('limit', limit);
  if (folder && folder !== 'all') params.set('folder', folder);
  if (search && search.trim()) params.set('search', search.trim());

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: getAuthHeaders(true),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch media assets.');
  }

  return data;
}

/**
 * Fetch a single media item by ID with usage details
 */
export async function fetchMediaById(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: getAuthHeaders(true),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch media details.');
  }

  return data.data;
}

/**
 * Upload an image file with metadata to Cloudinary via Express
 */
export async function uploadMediaFile(file, { folder = 'haxudio/misc', altText = '', title = '', caption = '' } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (altText) formData.append('altText', altText);
  if (title) formData.append('title', title);
  if (caption) formData.append('caption', caption);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: getAuthHeaders(false), // FormData handles multipart boundaries automatically
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const error = new Error(data.message || 'Image upload failed.');
    error.code = data.code;
    error.status = res.status;
    throw error;
  }

  return data.data;
}

/**
 * Update media metadata (altText, title, caption, folder)
 */
export async function updateMediaMetadata(id, updates) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(updates),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update media metadata.');
  }

  return data.data;
}

/**
 * Delete a media item safely (will fail with 409 if in use)
 */
export async function deleteMedia(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(true),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const error = new Error(data.message || 'Failed to delete media item.');
    error.status = res.status;
    error.code = data.code;
    error.references = data.references || [];
    error.usageCount = data.usageCount || 0;
    throw error;
  }

  return data;
}

/**
 * Check real-time usage references for a media asset
 */
export async function fetchMediaUsage(id) {
  const res = await fetch(`${API_BASE}/${id}/usage`, {
    headers: getAuthHeaders(true),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to check media usage.');
  }

  return data.data;
}
