/**
 * Validation and sanitization for Media uploads and metadata updates
 */

const ALLOWED_FOLDERS = [
  'haxudio/services',
  'haxudio/projects',
  'haxudio/team',
  'haxudio/testimonials',
  'haxudio/content',
  'haxudio/branding',
  'haxudio/seo',
  'haxudio/misc',
];

const FOLDER_ALIAS_MAP = {
  services: 'haxudio/services',
  projects: 'haxudio/projects',
  team: 'haxudio/team',
  testimonials: 'haxudio/testimonials',
  content: 'haxudio/content',
  branding: 'haxudio/branding',
  seo: 'haxudio/seo',
  misc: 'haxudio/misc',
};

/**
 * Validates and normalizes folder target
 * @param {string} rawFolder
 * @returns {string} Normalized folder path
 */
function normalizeFolder(rawFolder) {
  if (!rawFolder || typeof rawFolder !== 'string') {
    return 'haxudio/misc';
  }

  const clean = rawFolder.trim().toLowerCase().replace(/\/+/g, '/').replace(/^\/|\/$/g, '');

  // Check alias map
  if (FOLDER_ALIAS_MAP[clean]) {
    return FOLDER_ALIAS_MAP[clean];
  }

  // Check direct allowlist
  if (ALLOWED_FOLDERS.includes(clean)) {
    return clean;
  }

  // Reject paths containing traversal
  if (clean.includes('..') || clean.includes('\\')) {
    return 'haxudio/misc';
  }

  // If starts with haxudio/ and suffix is valid
  const parts = clean.split('/');
  if (parts.length === 2 && parts[0] === 'haxudio' && FOLDER_ALIAS_MAP[parts[1]]) {
    return clean;
  }

  return 'haxudio/misc';
}

/**
 * Validates metadata updates (PUT /api/admin/media/:id)
 * @param {Object} body
 * @returns {{ isValid: boolean, errors: string[], sanitized: Object }}
 */
function validateMediaUpdate(body) {
  const errors = [];
  const sanitized = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { isValid: false, errors: ['Request body must be an object'], sanitized: {} };
  }

  // Reject attempts to update protected fields
  const forbiddenFields = [
    '_id', 'id', 'provider', 'publicId', 'url', 'secureUrl',
    'resourceType', 'format', 'bytes', 'uploadedBy', 'createdAt', 'updatedAt'
  ];

  for (const field of forbiddenFields) {
    if (body[field] !== undefined) {
      delete body[field];
    }
  }

  if (body.altText !== undefined) {
    if (typeof body.altText !== 'string') {
      errors.push('Alt text must be a string.');
    } else {
      sanitized.altText = body.altText.trim().slice(0, 300);
    }
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string') {
      errors.push('Title must be a string.');
    } else {
      sanitized.title = body.title.trim().slice(0, 150);
    }
  }

  if (body.caption !== undefined) {
    if (typeof body.caption !== 'string') {
      errors.push('Caption must be a string.');
    } else {
      sanitized.caption = body.caption.trim().slice(0, 500);
    }
  }

  if (body.folder !== undefined) {
    sanitized.folder = normalizeFolder(body.folder);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

module.exports = {
  ALLOWED_FOLDERS,
  FOLDER_ALIAS_MAP,
  normalizeFolder,
  validateMediaUpdate,
};
