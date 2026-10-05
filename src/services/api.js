/**
 * API Service Layer for Haxudio Digital Solutions
 * 
 * BACKEND INTEGRATION NOTICE FOR DEVELOPERS:
 * This module defines the clear contract and integration points for connecting
 * a live backend (Node.js, Express, Next.js API routes, Firebase, or headless CMS).
 * 
 * Replace these placeholder asynchronous routines with real fetch/axios requests
 * to your backend endpoints (e.g. `/api/contact`, `/api/quotes`, `/api/newsletter`).
 */

/**
 * Submits a contact inquiry from the /contact page or modal.
 * @param {Object} inquiryData
 * @param {string} inquiryData.name - Full name of the client
 * @param {string} inquiryData.email - Client email address
 * @param {string} inquiryData.phone - Client phone number (e.g. +92 300 1234567)
 * @param {string} inquiryData.businessName - Name of company / organization
 * @param {string} inquiryData.service - Requested service ID (e.g. 'web-development')
 * @param {string} inquiryData.budget - Selected budget tier
 * @param {string} inquiryData.message - Project goals & description
 * @returns {Promise<{success: boolean, message: string, inquiryId?: string}>}
 */
export async function submitContactInquiry(inquiryData) {
  // Validate required client fields
  if (!inquiryData.name || !inquiryData.email || !inquiryData.message) {
    throw new Error('Please provide your name, valid email, and project message.');
  }

  // Basic email syntax check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(inquiryData.email)) {
    throw new Error('Please provide a valid email address.');
  }

  const payload = {
    name: inquiryData.name,
    email: inquiryData.email,
    phone: inquiryData.phone || '',
    company: inquiryData.businessName || inquiryData.company || '',
    service: inquiryData.service || 'general',
    budget: inquiryData.budget || '',
    message: inquiryData.message,
    source: 'contact-page',
    pageUrl: typeof window !== 'undefined' ? window.location.href : '',
  };

  const response = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to submit inquiry. Please try again.');
  }

  // Session storage record for user convenience
  try {
    const existing = JSON.parse(sessionStorage.getItem('haxudio_inquiries') || '[]');
    existing.push({
      ...payload,
      id: data.inquiryId,
      timestamp: new Date().toISOString(),
    });
    sessionStorage.setItem('haxudio_inquiries', JSON.stringify(existing));
  } catch (e) {
    // Session storage fail-safe
  }

  return {
    success: true,
    message: data.message || 'Thank you! Your project inquiry has been received. Our Quetta team will contact you within 24 business hours.',
    inquiryId: data.inquiryId || 'HAX-' + Math.floor(100000 + Math.random() * 900000),
  };
}

/**
 * Submits an interactive quote calculation request.
 * Connects directly to MongoDB Atlas via POST /api/inquiries
 * @param {Object} quoteData
 * @param {string} quoteData.service - Selected service
 * @param {string} quoteData.projectType - Specific scope package
 * @param {string} quoteData.timeline - Target delivery window
 * @param {string} quoteData.contactName - Contact person
 * @param {string} quoteData.contactPhoneOrEmail - Contact method
 * @param {string} quoteData.businessName - Company / organization
 * @param {string} quoteData.notes - Custom notes
 * @returns {Promise<{success: boolean, message: string, quoteRef: string}>}
 */
export async function requestProjectQuote(quoteData) {
  const contact = (quoteData.contactPhoneOrEmail || '').trim();
  const isEmail = contact.includes('@');

  const detailedMessage = [
    `Interactive Scope Builder Request:`,
    `- Service: ${quoteData.service || 'Not specified'}`,
    `- Scope Tier: ${quoteData.projectType || 'Standard'}`,
    `- Target Timeline: ${quoteData.timeline || 'Flexible'}`,
    quoteData.notes ? `- Client Notes: ${quoteData.notes}` : '',
  ].filter(Boolean).join('\n');

  const payload = {
    name: quoteData.contactName || 'Quote Requester',
    email: isEmail ? contact : `${(quoteData.contactName || 'client').toLowerCase().replace(/\s+/g, '')}@estimate.haxudio.local`,
    phone: !isEmail ? contact : '',
    company: quoteData.businessName || '',
    service: quoteData.service || 'web-development',
    budget: quoteData.projectType || 'growth',
    message: detailedMessage,
    source: 'quote-builder',
    pageUrl: typeof window !== 'undefined' ? window.location.href : '',
  };

  const response = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to submit quote estimate request.');
  }

  const quoteRef = data.inquiryId ? `EST-${data.inquiryId.slice(-6).toUpperCase()}` : 'EST-' + Math.floor(1000 + Math.random() * 9000);

  return {
    success: true,
    message: 'Your custom project estimate request has been logged. Our engineering leads will prepare an itemized scope for your review.',
    quoteRef,
    inquiryId: data.inquiryId,
  };
}

/**
 * Subscribes an email to the Haxudio digital insights newsletter.
 * @param {string} email
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function subscribeNewsletter(email) {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    message: 'You have been subscribed to Haxudio Digital Insights.',
  };
}

/**
 * Submits a free technical website audit request.
 * @param {Object} auditData
 * @param {string} auditData.websiteUrl - Current website URL
 * @param {string} auditData.email - Client email
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function requestWebsiteAudit(auditData) {
  if (!auditData.websiteUrl) {
    throw new Error('Please specify your current website URL.');
  }

  await new Promise((resolve) => setTimeout(resolve, 700));

  return {
    success: true,
    message: 'Your website audit request has been queued. We will inspect your Core Web Vitals, mobile responsiveness, and SEO crawlability.',
  };
}
