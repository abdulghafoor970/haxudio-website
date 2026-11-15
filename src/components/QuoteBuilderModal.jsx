'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { SERVICES } from '../data/services';
import { requestProjectQuote } from '../services/api';

export default function QuoteBuilderModal({ isOpen, onClose, preselectedService }) {
  const [selectedService, setSelectedService] = useState(preselectedService || 'web-development');
  const [projectScope, setProjectScope] = useState('growth');
  const [timeline, setTimeline] = useState('standard');
  const [contactName, setContactName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
    }
  }, [preselectedService]);

  useEffect(() => {
    if (!isOpen) {
      setSubmissionResult(null);
      setErrorMessage('');
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactInfo.trim()) {
      setErrorMessage('Please provide your name and contact phone or email.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const result = await requestProjectQuote({
        service: selectedService,
        projectType: projectScope,
        timeline,
        contactName,
        businessName,
        contactPhoneOrEmail: contactInfo,
        notes: projectNotes,
      });

      setSubmissionResult(result);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit quote request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 bg-[#121316]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] bg-[#FAF8F5] rounded-lg shadow-2xl border border-[#121316]/10 flex flex-col overflow-hidden min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#121316]/10 flex items-center justify-between gap-4 bg-white shrink-0">
          <div className="min-w-0">
            <span className="text-xs uppercase tracking-widest text-[#C25E34] font-semibold block">
              Project Estimate & Scope Builder
            </span>
            <h2 id="quote-modal-title" className="font-display text-xl sm:text-2xl font-bold text-[#121316] truncate">
              Start Your Project with Haxudio
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#666461] hover:text-[#121316] rounded-md hover:bg-neutral-100 shrink-0 cursor-pointer"
            aria-label="Close Quote Estimator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          {submissionResult ? (
            <div className="p-8 sm:p-12 text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#121316]">
                Estimate Request Received
              </h3>
              <p className="text-sm text-[#666461] max-w-md mx-auto leading-relaxed">
                {submissionResult.message} Reference Code:{' '}
                <strong className="font-mono text-[#121316]">{submissionResult.quoteRef}</strong>.
                Our Quetta team will review your requirements and reach out directly.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#121316] rounded-md hover:bg-[#252830] cursor-pointer"
                >
                  Close & Return to Site
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Step 1: Select Service */}
              <div>
                <label
                  htmlFor="quote-service-select"
                  className="block text-xs font-bold uppercase tracking-wider text-[#121316] mb-2"
                >
                  1. Select Primary Service
                </label>
                <select
                  id="quote-service-select"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#121316]/15 rounded-md text-[#121316] focus:outline-none focus:border-[#121316]"
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Project Scope / Tier */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-[#121316] mb-2">
                  2. Project Scope & Tier
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'starter', label: 'Starter / Local', desc: 'Essential presence for Quetta storefronts' },
                    { id: 'growth', label: 'Growth / Scaling', desc: 'Custom engineering & regional acquisition' },
                    { id: 'custom', label: 'Enterprise / Full-Stack', desc: 'Bespoke systems & nationwide reach' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setProjectScope(tier.id)}
                      className={`text-left p-3.5 rounded-md border text-xs transition-all cursor-pointer ${
                        projectScope === tier.id
                          ? 'bg-[#121316] text-[#FAF8F5] border-[#121316] shadow-md'
                          : 'bg-white text-[#121316] border-[#121316]/10 hover:border-[#121316]/30'
                      }`}
                    >
                      <span className="font-bold block text-sm mb-1">{tier.label}</span>
                      <span className={projectScope === tier.id ? 'text-neutral-300' : 'text-[#666461]'}>
                        {tier.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Target Timeline */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-[#121316] mb-2">
                  3. Target Timeline
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { id: 'urgent', label: 'Immediate (< 2 weeks)' },
                    { id: 'standard', label: 'Standard (3 – 5 weeks)' },
                    { id: 'flexible', label: 'Flexible (> 6 weeks)' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTimeline(t.id)}
                      className={`py-2 px-3 text-center rounded-md border font-medium transition-all cursor-pointer ${
                        timeline === t.id
                          ? 'bg-[#121316] text-[#FAF8F5] border-[#121316]'
                          : 'bg-white text-[#121316] border-[#121316]/10 hover:border-[#121316]/30'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Contact Information */}
              <div className="space-y-4 pt-2 border-t border-[#121316]/10">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#121316]">
                  4. Your Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your Name *"
                    aria-label="Your Name"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#121316]/15 rounded-md text-[#121316] focus:outline-none focus:border-[#121316]"
                  />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business / Clinic / Brand Name"
                    aria-label="Business or Brand Name"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#121316]/15 rounded-md text-[#121316] focus:outline-none focus:border-[#121316]"
                  />
                </div>

                <input
                  type="text"
                  required
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="WhatsApp Number or Email Address *"
                  aria-label="WhatsApp Number or Email Address"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#121316]/15 rounded-md text-[#121316] focus:outline-none focus:border-[#121316]"
                />

                <textarea
                  rows="3"
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  placeholder="Tell us briefly about your project goals or existing website URL..."
                  aria-label="Project Notes"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#121316]/15 rounded-md text-[#121316] focus:outline-none focus:border-[#121316]"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <span className="text-xs text-[#666461]">
                  Quetta Office: M.A Jinnah Road
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-[#FAF8F5] bg-[#121316] rounded-md hover:bg-[#252830] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Project Scope</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
