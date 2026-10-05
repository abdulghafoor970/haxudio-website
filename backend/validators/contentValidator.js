/**
 * Validation and sanitization for WebsiteContent submissions
 */

const ALLOWED_PAGES = ['home', 'about', 'contact'];
const SECTION_REGEX = /^[a-zA-Z0-9_-]{2,50}$/;

function isSafeKey(key) {
  return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

function sanitizeObject(obj, depth = 0) {
  if (depth > 5) return null;
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return obj.trim();
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1)).filter((item) => item !== null);
  }
  if (typeof obj === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
      if (isSafeKey(k)) {
        clean[k] = sanitizeObject(v, depth + 1);
      }
    }
    return clean;
  }
  return null;
}

function validateContentPayload(page, section, body) {
  const errors = [];

  if (!page || !ALLOWED_PAGES.includes(page.toLowerCase())) {
    errors.push(`Page must be one of: ${ALLOWED_PAGES.join(', ')}.`);
  }

  if (!section || !SECTION_REGEX.test(section)) {
    errors.push('Section must be 2-50 alphanumeric characters (hyphens and underscores allowed).');
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    errors.push('Request body must be a valid JSON object.');
    return { isValid: false, errors, sanitized: null };
  }

  const sanitizedContent = sanitizeObject(body.content !== undefined ? body.content : body);

  if (!sanitizedContent || typeof sanitizedContent !== 'object' || Array.isArray(sanitizedContent)) {
    errors.push('Content must be a valid structured object.');
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (title.length > 150) {
    errors.push('Section title cannot exceed 150 characters.');
  }

  const isActive = typeof body.isActive === 'boolean' ? body.isActive : true;

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      page: page.toLowerCase().trim(),
      section: section.toLowerCase().trim(),
      title,
      content: sanitizedContent,
      isActive,
    },
  };
}

module.exports = {
  ALLOWED_PAGES,
  validateContentPayload,
  sanitizeObject,
};
