'use client';

import React, { useState, useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import SectionHeading from '../components/SectionHeading';
import { BRAND } from '../data/navigation';
import { HAXUDIO_SOCIALS, SOCIAL_LINKS } from '../data/socials';
import { SERVICES } from '../data/services';
import { PAGE_SEO } from '../data/seo';
import LocationMapCard from '../components/LocationMapCard';
import { submitContactInquiry } from '../services/api';
import { fetchPublicContent } from '../services/contentApi';
import { useSettings } from '../context/SettingsContext';
import { MapPin, Mail, Phone, Clock, CheckCircle2, ArrowRight, Loader2, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const { settings } = useSettings();
  const [contactContent, setContactContent] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      try {
        const res = await fetchPublicContent('contact');
        if (isMounted && res?.sections) {
          const normalized = {};
          for (const [key, val] of Object.entries(res.sections)) {
            normalized[key.toLowerCase()] = val.content || {};
          }
          setContactContent(normalized);
        }
      } catch (err) {
        console.warn('[ContactPage] Error loading dynamic content:', err);
      }
    }
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    service: 'web-development',
    budget: '50k-150k',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const result = await submitContactInquiry(formData);
      setSubmissionResult(result);
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        service: 'web-development',
        budget: '50k-150k',
        message: '',
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title={PAGE_SEO.contact.title}
        description={PAGE_SEO.contact.description}
        canonical="https://www.haxudio.com/contact"
      />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="max-w-4xl space-y-5 mb-16">
          <span className="text-xs uppercase tracking-widest text-[#C25E34] font-semibold">
            {contactContent.hero?.eyebrow || 'Start a Conversation · Quetta, Balochistan, Pakistan'}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-[1.1] text-balance">
            {contactContent.hero?.heading || 'Contact Haxudio Digital Solutions.'}
          </h1>
          <p className="text-lg text-[#666461] leading-relaxed">
            {contactContent.hero?.description || 'Looking for a digital agency in Quetta or a reliable digital solutions partner in Pakistan? Get in touch with Haxudio Digital Solutions to discuss your project.'}
          </p>
          <p className="text-sm text-[#666461] leading-relaxed">
            {contactContent.hero?.supportingText || 'Have a clear project specification or simply exploring possibilities for your brand? Reach out directly via WhatsApp, phone, or our inquiry form below. Our Quetta engineering and design team reviews every request within 24 hours.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#121316]/10 rounded-xl p-8 sm:p-10 shadow-sm">
            {submissionResult ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="font-display text-2xl font-bold text-[#121316]">
                  Inquiry Dispatched Successfully
                </h2>
                <p className="text-sm text-[#666461] max-w-md mx-auto leading-relaxed">
                  {submissionResult.message}
                </p>
                <p className="text-xs font-mono text-[#121316] pt-1">
                  Inquiry Reference: <strong>{submissionResult.inquiryId}</strong>
                </p>
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => setSubmissionResult(null)}
                    className="px-6 py-2.5 text-xs font-semibold text-white bg-[#121316] rounded-md hover:bg-[#252830]"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[#121316] mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Abdul Ghafoor"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-[#121316]/15 rounded-md text-[#121316] focus:bg-white focus:outline-none focus:border-[#121316]"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#121316] mb-2">
                      Work Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-[#121316]/15 rounded-md text-[#121316] focus:bg-white focus:outline-none focus:border-[#121316]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-[#121316] mb-2">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 300 0000000"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-[#121316]/15 rounded-md text-[#121316] focus:bg-white focus:outline-none focus:border-[#121316]"
                    />
                  </div>

                  <div>
                    <label htmlFor="businessName" className="block text-xs font-bold uppercase tracking-wider text-[#121316] mb-2">
                      Business or Organization
                    </label>
                    <input
                      id="businessName"
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Company Name, Clinic, Store"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-[#121316]/15 rounded-md text-[#121316] focus:bg-white focus:outline-none focus:border-[#121316]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="service" className="block text-xs font-bold uppercase tracking-wider text-[#121316] mb-2">
                      Service Required
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-[#121316]/15 rounded-md text-[#121316] focus:bg-white focus:outline-none focus:border-[#121316]"
                    >
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="budget" className="block text-xs font-bold uppercase tracking-wider text-[#121316] mb-2">
                      Estimated Project Budget
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-[#121316]/15 rounded-md text-[#121316] focus:bg-white focus:outline-none focus:border-[#121316]"
                    >
                      <option value="under-50k">Under 50,000 PKR (Starter Project)</option>
                      <option value="50k-150k">50,000 – 150,000 PKR (Standard Custom Site)</option>
                      <option value="150k-350k">150,000 – 350,000 PKR (Advanced / E-Commerce)</option>
                      <option value="above-350k">350,000+ PKR (Enterprise / Web Application)</option>
                      <option value="retainer">Monthly Growth Retainer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-[#121316] mb-2">
                    Project Goals & Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your project, current pain points, target launch date, or any reference websites you admire..."
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-[#121316]/15 rounded-md text-[#121316] focus:bg-white focus:outline-none focus:border-[#121316]"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 text-xs font-semibold text-[#FAF8F5] bg-[#121316] rounded-md hover:bg-[#252830] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Project Inquiry</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Office Address, Direct Contacts, Location (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#121316]/10 rounded-xl p-8 space-y-6 shadow-sm">
              <span className="text-xs uppercase tracking-widest text-[#C25E34] font-bold">
                Direct Contact
              </span>

              <h2 className="font-display text-2xl font-bold text-[#121316]">
                {BRAND.name}
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-[#121316]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C25E34] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#121316]">Quetta Headquarters</p>
                    <p className="text-[#121316] font-medium">{settings?.contact?.address || BRAND.address}</p>
                    <a
                      href={settings?.contact?.mapUrl || HAXUDIO_SOCIALS.googleBusinessProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#C25E34] hover:underline font-semibold mt-1"
                    >
                      <span>Open in Google Maps / Business Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#C25E34] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#121316]">General & Project Inquiries</p>
                    <a
                      href={`mailto:${settings?.contact?.primaryEmail || BRAND.email}`}
                      className="text-[#666461] hover:text-[#121316] underline"
                    >
                      {settings?.contact?.primaryEmail || BRAND.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#C25E34] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#121316]">Direct Phone / WhatsApp</p>
                    <a
                      href={settings?.contact?.whatsappUrl || HAXUDIO_SOCIALS.whatsapp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] hover:underline font-semibold flex items-center gap-1 mt-0.5"
                    >
                      <span>{settings?.contact?.whatsapp || HAXUDIO_SOCIALS.whatsapp.number}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#C25E34] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#121316]">Operating Hours</p>
                    <p className="text-[#666461]">{settings?.business?.workingHours || BRAND.workingHours}</p>
                  </div>
                </div>
              </div>

              {/* Social Channels List */}
              <div className="pt-4 border-t border-neutral-100 space-y-2">
                <span className="block text-xs uppercase tracking-wider font-semibold text-[#121316]">
                  Social Media Channels
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {SOCIAL_LINKS.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[#121316] transition-colors"
                    >
                      <span className="font-semibold block">{s.name}</span>
                      <span className="text-[11px] text-[#666461]">{s.handle}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 text-xs text-[#666461] space-y-1">
                <span className="block font-semibold text-[#121316]">Official Domain:</span>
                <a
                  href={BRAND.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-[#C25E34]"
                >
                  {BRAND.website}
                </a>
              </div>
            </div>

            {/* Pakistan Nationwide Reach Note */}
            <div className="p-6 bg-[#FAF8F5] border border-neutral-200 rounded-xl space-y-2 text-xs text-[#666461]">
              <span className="font-semibold text-[#121316] block uppercase tracking-wider">
                Beyond Quetta
              </span>
              <p className="leading-relaxed">
                We frequently execute remote sprints for clients in Karachi, Lahore, Islamabad,
                Rawalpindi, and Peshawar via structured weekly video check-ins and staging environments.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Location Map Card with Google Business Profile */}
        <LocationMapCard className="mt-16" />
      </div>
    </>
  );
}
