/**
 * Sanitization & Validation for Client Inquiry submissions
 */

function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function validateAndSanitizeInquiry(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      errors: ['Invalid inquiry payload format.'],
      sanitized: null,
    };
  }

  // Extract raw fields with fallbacks (supporting both company and businessName)
  const rawName = body.name || body.contactName || '';
  const rawEmail = body.email || (body.contactPhoneOrEmail && body.contactPhoneOrEmail.includes('@') ? body.contactPhoneOrEmail : '');
  const rawPhone = body.phone || (!body.email && body.contactPhoneOrEmail && !body.contactPhoneOrEmail.includes('@') ? body.contactPhoneOrEmail : (body.phone || ''));
  const rawCompany = body.company || body.businessName || '';
  const rawService = body.service || '';
  const rawBudget = body.budget || body.projectType || '';
  const rawMessage = body.message || body.notes || body.projectNotes || '';
  const rawSource = body.source || (body.projectType ? 'quote-builder' : 'contact-page');
  const rawPageUrl = body.pageUrl || '';

  const sanitized = {
    name: stripHtml(rawName),
    email: stripHtml(rawEmail).toLowerCase(),
    phone: stripHtml(rawPhone),
    company: stripHtml(rawCompany),
    service: stripHtml(rawService) || 'general',
    budget: stripHtml(rawBudget),
    message: stripHtml(rawMessage),
    source: stripHtml(rawSource) || 'contact-page',
    pageUrl: stripHtml(rawPageUrl),
  };

  // Validation checks
  if (!sanitized.name) {
    errors.push('Full name is required.');
  } else if (sanitized.name.length < 2) {
    errors.push('Name must be at least 2 characters long.');
  } else if (sanitized.name.length > 100) {
    errors.push('Name cannot exceed 100 characters.');
  }

  if (!sanitized.email) {
    errors.push('A valid email address is required.');
  } else if (!EMAIL_REGEX.test(sanitized.email)) {
    errors.push('Please provide a valid email address.');
  } else if (sanitized.email.length > 120) {
    errors.push('Email address is too long.');
  }

  if (!sanitized.message) {
    errors.push('Project message or inquiry details are required.');
  } else if (sanitized.message.length < 5) {
    errors.push('Message must be at least 5 characters long.');
  } else if (sanitized.message.length > 5000) {
    errors.push('Message cannot exceed 5000 characters.');
  }

  if (sanitized.phone && sanitized.phone.length > 50) {
    errors.push('Phone number cannot exceed 50 characters.');
  }

  if (sanitized.company && sanitized.company.length > 150) {
    errors.push('Company name cannot exceed 150 characters.');
  }

  if (sanitized.service && sanitized.service.length > 100) {
    errors.push('Service field is too long.');
  }

  if (sanitized.budget && sanitized.budget.length > 100) {
    errors.push('Budget field is too long.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

module.exports = {
  validateAndSanitizeInquiry,
  stripHtml,
};
